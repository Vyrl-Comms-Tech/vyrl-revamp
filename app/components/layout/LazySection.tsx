"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LazySectionProps = {
  children: ReactNode;
  /** Pixels before the section enters the viewport to start rendering it. */
  rootMargin?: string;
  /** Element to render in place of the section until it's near-viewport. */
  placeholder?: ReactNode;
};

// Defers mounting (and therefore all network requests: images, videos,
// GSAP setup) of a below-the-fold section until it's about to scroll into
// view, instead of every section on a page loading all at once on first
// paint.
export default function LazySection({
  children,
  rootMargin = "600px 0px",
  placeholder = null,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (isNear) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    // Belt-and-suspenders against a real race: if the page's layout is
    // still settling at the exact moment observer.observe() runs (web
    // fonts still loading and reflowing earlier sections, other
    // LazySections above this one still expanding from their own
    // placeholder height, etc.), this placeholder's rect can shift
    // into/out of the observer's rootMargin between when the browser
    // computed its initial intersection state and when observe() was
    // actually called — IntersectionObserver only reports on genuine
    // rect *changes* after that point, so a placeholder that was
    // already within rootMargin the whole time, but only settled there
    // milliseconds after observe() ran, can end up with no observer
    // callback firing at all until the user's next real scroll nudges
    // it. Reproduced on a production static-export build: every
    // LazySection below the fold stayed stuck on its placeholder
    // (0-height div) through the entire initial load — confirmed by
    // manually scrolling once, which is exactly the kind of event that
    // would newly trigger a callback the observer otherwise missed.
    // requestAnimationFrame lets one paint happen first so this reads
    // the settled rect, not whatever existed the instant observe() ran.
    const rafId = requestAnimationFrame(() => {
      if (isNear) return;
      const rect = node.getBoundingClientRect();
      // rootMargin is only ever "<px> 0px" in practice here (see the
      // default above and every call site) — parse just the vertical
      // component rather than building a full CSS margin parser for a
      // fallback check.
      const marginPx = parseInt(rootMargin, 10) || 0;
      const nearViewport =
        rect.bottom >= -marginPx &&
        rect.top <= window.innerHeight + marginPx;
      if (nearViewport) {
        setIsNear(true);
        observer.disconnect();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [isNear, rootMargin]);

  // Mounting the real section changes the document's total scrollable
  // height (the placeholder is usually shorter, or height:0 — see
  // page.tsx's own comments on Services3d/Collective's placeholder for
  // a case where that gap mattered even more directly). SmoothScroll.jsx
  // caches that height in Lenis and only re-measures it on ScrollTrigger's
  // "refresh" event — nothing here was ever triggering one, so Lenis
  // kept clamping scroll to the stale (shorter) height it measured
  // before this section existed. That read as the page "getting stuck"
  // partway through the newly-added content, with whatever comes after
  // (e.g. the Footer) unreachable — until a full page refresh forced a
  // fresh measurement. Runs in useLayoutEffect so it fires the moment
  // this section's real DOM lands, before the browser paints or the
  // user's in-flight scroll can act on the stale height.
  useLayoutEffect(() => {
    if (!isNear) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [isNear]);

  if (isNear) return <>{children}</>;

  return <div ref={ref}>{placeholder}</div>;
}
