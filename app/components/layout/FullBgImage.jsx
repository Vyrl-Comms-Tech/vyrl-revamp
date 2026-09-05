"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/full-bg-image.css";
import "../../styles/footer.css";
import VyrlCtaButton from "../layout/VyrlCtaButton";
import FooterContent from "./FooterContent";

gsap.registerPlugin(ScrollTrigger);

// How far the background image drifts (in px) relative to the container's
// scroll progress through the viewport. Higher = stronger parallax.
const PARALLAX_STRENGTH = 0.25;

const MOBILE_BREAKPOINT = 800;

function FullBgImage() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const rafIdRef = useRef(null);

  // Parallax on the background image — unrelated to the pin/reveal below.
  useEffect(() => {
    const container = containerRef.current;
    const bg = bgRef.current;
    if (!container || !bg) return undefined;

    const computeTarget = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      // Progress goes 0 -> 1 as the section travels from just entering
      // the bottom of the viewport to just leaving the top.
      const progress =
        (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      targetOffsetRef.current =
        (clamped - 0.5) * rect.height * PARALLAX_STRENGTH;
    };

    const tick = () => {
      // Lerp toward the target each frame for a smooth, trailing motion
      // instead of snapping straight to the scroll position.
      currentOffsetRef.current +=
        (targetOffsetRef.current - currentOffsetRef.current) * 0.12;
      bg.style.transform = `translate3d(0, ${currentOffsetRef.current.toFixed(2)}px, 0)`;
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const handleScroll = () => computeTarget();
    const handleResize = () => computeTarget();

    computeTarget();
    rafIdRef.current = requestAnimationFrame(tick);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Same pin/reveal used by OrbitGallery: pin this section in place while
  // it shrinks/fades/rises away and .footer (starting translateY(100%)
  // scale(0.8) per footer.css) scrubs up to its resting position on top
  // of it. Skipped on mobile/reduced-motion, matching OrbitGallery — see
  // the max-width: 800px override in footer.css that puts .footer back
  // in its plain static position there instead of the translateY(100%)
  // it starts at for this desktop reveal.
  useEffect(() => {
    const section = sectionRef.current;
    const content = containerRef.current;
    if (!section || !content) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const skipPin = prefersReducedMotion || isMobile;
    if (skipPin) return undefined;

    const ctx = gsap.context(() => {
      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=110%",
          anticipatePin: 1,
          pin: true,
          scrub: 1,
        },
      });

      pinTimeline
        .to(".footer", {
          y: 0,
          scale: 1,
          ease: "none",
        })
        .to(
          content,
          {
            yPercent: -100,
            scale: 0.9,
            opacity: 0,
            filter: "blur(12px)",
            ease: "power2.in",
          },
          "<",
        );

      // Earlier pinned sections on the page can still be settling their
      // own pin-spacer height when this ScrollTrigger is created — same
      // class of fix OrbitGallery/Work/PartnersSection all apply — so
      // give the layout two frames to finish before measuring "top top".
      let cancelled = false;
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          ScrollTrigger.refresh();
        });
      });

      return () => {
        cancelled = true;
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="full-bg-image" ref={sectionRef}>
      <div className="consultation-main-container" ref={containerRef}>
        <div className="consultation-bg" ref={bgRef}></div>
        <div className="consultation-text-content">
          <h1>The Collective Behind Every Experience</h1>
          <p>
            Built by a collective of thinkers, makers, developers, creators, and
            growth specialists, all working together to turn bold ideas into
            digital systems that perform
          </p>
     <span>
          <VyrlCtaButton
            label="Explore Services"
            href="/services"
            className="vyrl-cta--invert"
          />
        </span>
        </div>
      </div>
      <footer id="footer-mble-hide" className="footer footer--no-radius">
        <FooterContent />
      </footer>
    </section>
  );
}

export default FullBgImage;
