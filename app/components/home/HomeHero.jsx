"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import UnicornEmbed from "../layout/UnicornEmbed";
import "../../styles/home-hero.css";
import TextAnimation from "./TextAnimation";

gsap.registerPlugin(ScrollTrigger);

const HomeHero = () => {
  const heroRef = useRef(null);
  const spacerRef = useRef(null);

  // .homehero is position: fixed and stays pinned in place while
  // .text-and-cards scrolls up over it (see home-hero.css) — this adds
  // the Awwwards-style "receding" polish on top of that plain cover:
  // as the incoming section's top edge approaches/passes over the
  // hero, the hero itself scrubs a slight scale-down + darken, reading
  // as the old section sinking back and dimming rather than just being
  // instantly hidden underneath the new one.
  useGSAP(() => {
    const hero = heroRef.current;
    const spacer = spacerRef.current;
    if (!hero || !spacer) return;

    const st = ScrollTrigger.create({
      // .homehero-spacer occupies the exact scroll range .homehero
      // would have taken up in normal flow — using it (not .homehero
      // itself, which is position: fixed and has no meaningful
      // scroll-linked box to measure against) as the trigger means
      // this tracks precisely how far the page has scrolled through
      // that reserved range, i.e. exactly when .text-and-cards is
      // arriving over the hero.
      trigger: spacer,
      start: "top top",
      end: "bottom top",
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        // opacity fades toward whatever's BEHIND the element — since
        // .text-and-cards has a light background (--bodybg), fading
        // opacity here blended the hero toward white/washed-out, not
        // black. Pushing brightness further down instead (toward near-
        // black, not just dimmed) is what actually reads as the hero
        // darkening into black as it recedes — no opacity/whitish fade
        // involved at all.
        gsap.set(hero, {
          scale: 1 - p * 0.12,
          filter: `brightness(${1 - p * 0.95})`,
          willChange: "transform, filter",
        });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <>
      <div className="homehero" ref={heroRef}>
        {/* <UnicornEmbed projectId="hTmImmClFTsnrs3vLhd0" /> */}
        <div className="relative h-full w-full overflow-hidden">
          <img
            src="/fall1.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          <UnicornEmbed
            projectId="hTmImmClFTsnrs3vLhd0"
            className="absolute inset-0"
          />
        </div>
        <div className="homehero-fade" aria-hidden="true" />

        <h1 className="homehero-heading">
          Modern Digital Experiences
          <br />
          Built For Brands That Move Different
        </h1>
        <p className="homehero-tag">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
          >
            <circle cx="4" cy="4" r="4" fill="white" />
          </svg>
          Digital Campaign
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
          >
            <circle cx="4" cy="4" r="4" fill="white" />
          </svg>
        </p>
      </div>
      {/* .homehero is position: fixed (see home-hero.css) and out of
          normal document flow — this reserves the 100vh of scroll room
          it would otherwise take up, so .text-and-cards right after it
          starts scrolling in from below a full viewport-height down
          instead of immediately overlapping it at the very top. */}
      <div className="homehero-spacer" ref={spacerRef} aria-hidden="true" />
    </>
  );
};

export default HomeHero;
