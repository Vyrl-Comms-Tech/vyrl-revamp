"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// iOS (iPhone/iPad, including iPadOS which reports as "Mac" but has
// touch support — see the maxTouchPoints check) already has its own
// native rubber-band momentum scroll, which is smooth on its own and
// which Lenis's touch handling was fighting/racing against elsewhere
// (see Services3d.jsx's mobile pin, which had to stop Lenis entirely
// during its own gesture handling for exactly this reason). Rather
// than patch every such interaction one at a time, iOS just never gets
// a Lenis instance at all — every window.lenis consumer in this
// codebase already reaches for it with `?.` or an `if (window.lenis)`
// guard, so leaving window.lenis unset here makes them all fall back
// to plain native scroll automatically, with no other changes needed.
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ masquerades as "Macintosh" in the UA string, but
    // unlike a real Mac it's a touch device — maxTouchPoints > 1
    // reliably tells the two apart.
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (isIOS()) {
      // No Lenis instance at all: ScrollTrigger still needs to hear
      // about native scroll events to stay in sync (normally relayed
      // via lenis.on("scroll", ScrollTrigger.update) below), so wire
      // that directly instead. html.preloader-active's CSS
      // (overflow:hidden, see globals.css) already blocks native scroll
      // during the preloader on its own — the lenis.stop() call further
      // down is only needed there because Lenis drives scroll
      // independent of overflow, which doesn't apply here.
      const onScroll = () => ScrollTrigger.update();
      window.addEventListener("scroll", onScroll, { passive: true });

      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

      // Same reasoning as the pathname effect below — a route change
      // can land on a page with different content height, and iOS has
      // no Lenis cache to resync, but ScrollTrigger's own trigger
      // positions still need re-measuring against the new layout.
      const handlePreloaderFinish = () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      window.addEventListener("preloader:finish", handlePreloaderFinish);

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("preloader:finish", handlePreloaderFinish);
        cancelAnimationFrame(raf);
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // PreLoader.tsx adds this class to <html> for as long as its overlay
    // is actually visible (see globals.css's matching html.preloader-active
    // overflow:hidden). That CSS blocks native/scrollbar scrolling, but
    // Lenis drives scroll itself independent of overflow — without also
    // stopping Lenis here, wheel/touch input during the intro still moved
    // the page, so whatever the user scrolled to during the ~4s preloader
    // showed the instant it faded, instead of the hero at the top.
    if (document.documentElement.classList.contains("preloader-active")) {
      lenis.stop();
    }

    lenis.on("scroll", ScrollTrigger.update);

    // Exposed so other components (e.g. Services3d.jsx's "skip section"
    // button) can call window.lenis.scrollTo(...) for a smooth
    // programmatic scroll that Lenis itself drives — a plain
    // window.scrollTo({behavior:"smooth"}) or a GSAP scrollTo tween
    // would both be a second animation fighting this instance for
    // control of the scroll position every frame.
    window.lenis = lenis;

    const update = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Pinned ScrollTriggers resize the pin-spacer, which changes the
    // page's scrollable height. Lenis caches that height internally, so
    // without this it can desync from real scroll position and lock up
    // mid-scroll through a pinned section.
    const handleRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", handleRefresh);
    ScrollTrigger.refresh();

    // Every section mounts and measures itself (ScrollTrigger pins,
    // viewport-unit-sized elements like the navbar) while the Preloader's
    // fixed, full-viewport overlay is still up and fonts/images are still
    // settling underneath it. The only other refresh trigger is the
    // pathname effect below, which never fires on first load — so without
    // this, those stale measurements stuck around until the user's first
    // scroll forced a reflow, which read as a broken/frozen layout
    // (e.g. a shrunk navbar) that only "fixed itself" once you scrolled.
    const handlePreloaderFinish = () => {
      lenis.start();
      lenis.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener("preloader:finish", handlePreloaderFinish);

    return () => {
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
      window.removeEventListener("preloader:finish", handlePreloaderFinish);
      gsap.ticker.remove(update);
      lenis.destroy();
      if (window.lenis === lenis) window.lenis = null;
    };
  }, []);

  // This component lives in the root layout, so it never remounts on
  // client-side navigation — Lenis's cached scroll height keeps
  // whatever the previous route measured. Simple pages with no
  // ScrollTrigger of their own (privacy-policy, terms-and-condition)
  // never trigger a "refresh" event to correct that, so after
  // navigating from a shorter page Lenis could still think the page
  // ends well before its real (much longer) content does — reading as
  // the page getting "stuck" partway through a scroll. Re-running
  // refresh on every route change re-measures against the new page's
  // actual height. rAF delay lets the new route's DOM paint first.
  useEffect(() => {
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

export default SmoothScroll;
