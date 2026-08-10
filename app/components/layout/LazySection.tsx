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
    return () => observer.disconnect();
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
