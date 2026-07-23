"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

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

    return () => {
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
      gsap.ticker.remove(update);
      lenis.destroy();
      if (window.lenis === lenis) window.lenis = null;
    };
  }, []);

  return null;
}

export default SmoothScroll;
