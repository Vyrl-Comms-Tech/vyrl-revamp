"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/orbit-gallery.css";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_IMAGES = [
  { src: "arab1.avif", alt: "Collective member 1" },
  { src: "arab2.avif", alt: "Collective member 2" },
  { src: "arab3.avif", alt: "Collective member 3" },
  { src: "arab4.avif", alt: "Collective member 4" },
  { src: "arab5.avif", alt: "Collective member 5" },
  { src: "banda1.avif", alt: "Collective member 6" },
  { src: "banda2.avif", alt: "Collective member 7" },
  //   { src: "banda3.avif", alt: "Collective member 8" },
  //   { src: "banda4.avif", alt: "Collective member 9" },
  { src: "jeikor.avif", alt: "Collective member 10" },
  { src: "jeikor2.avif", alt: "Collective member 11" },
  { src: "jeikor3.avif", alt: "Collective member 12" },
  //   { src: "jeikor4.avif", alt: "Collective member 13" },
  { src: "lala1.avif", alt: "Collective member 14" },
  { src: "lala2.avif", alt: "Collective member 15" },
  { src: "lala3.avif", alt: "Collective member 16" },
  { src: "lala4.avif", alt: "Collective member 17" },
];

const MOBILE_BREAKPOINT = 800;
const VELOCITY_TO_RADIANS = 0.00003;

export default function OrbitGallery({
  images = DEFAULT_IMAGES,
  heading = "The Collective Behind Every Experience",
  subheading = "Built by a collective of thinkers, makers, developers, creators, and growth specialists, all working together to turn bold ideas into digital systems that perform",
}) {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  cardRefs.current = [];

  const addCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current;
    if (!section || cards.length === 0) return;

    // Respect reduced-motion preference: render a static ring, no scroll animation.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      let orbitProgress = 0;
      let orbitRadiusX = getRadiusX();
      let orbitRadiusY = getRadiusY();
      const cardCount = cards.length;

      function getRadiusX() {
        return window.innerWidth < MOBILE_BREAKPOINT ? 260 : 540;
      }
      function getRadiusY() {
        return window.innerWidth < MOBILE_BREAKPOINT ? 190 : 320;
      }

      function updateOrbit() {
        cards.forEach((card, index) => {
          const angle = orbitProgress + (index / cardCount) * Math.PI * 2;
          const x = Math.cos(angle) * orbitRadiusX;
          const y = Math.sin(angle) * orbitRadiusY;

          const depth = (Math.sin(angle) + 1) / 2;
          const scale = 0.92 + depth * 0.24;
          const opacity = 0.45 + depth * 0.95;
          const zIndex = Math.round(depth * 800);

          gsap.set(card, {
            x,
            y,
            xPercent: -50,
            yPercent: -50,
            scale,
            opacity,
            zIndex,
          });
        });
      }

      updateOrbit();

      let trigger;
      if (!prefersReducedMotion) {
        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            orbitProgress += velocity * VELOCITY_TO_RADIANS;
            updateOrbit();
          },
        });
      }

      const handleResize = () => {
        orbitRadiusX = getRadiusX();
        orbitRadiusY = getRadiusY();
        updateOrbit();
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      // Footer (mounted globally in layout.tsx, right after this
      // section in the DOM) rises up and physically overlaps the bottom
      // portion of this section — this section itself never moves,
      // scales, or fades; it stays completely static on screen the
      // whole time. Once the footer (shorter than one viewport) has
      // fully risen, it permanently covers roughly its own height's
      // worth of the section's bottom, with the rest of the section
      // still visible above it — a true "footer sits on top of it"
      // overlap, not a full-screen handoff.
      //
      // Every earlier version here drove the footer's rise by leaving it
      // in normal document flow and pinning this section for some
      // computed amount of *extra scroll* — sized to the footer's own
      // height, a full viewport, or an adaptive mix of the two. All of
      // those hit the same wall: this section is the very last thing on
      // the page, and whenever the footer (trailing right after it) is
      // shorter than one viewport, the browser's real scrollable bottom
      // — document height minus one viewport — lands short of wherever
      // the pin would need to fully release, by exactly
      // (viewport height − footer height). That's not a tunable
      // distance, it's how browsers clamp scroll at the end of any page:
      // no pin-distance formula routes around it as long as the footer's
      // own height is what's providing the page's remaining real scroll
      // room.
      //
      // The fix is to stop depending on scroll position (and therefore
      // on the footer contributing real document height) entirely.
      // footer becomes position: fixed for the pin's whole duration —
      // out of document flow — and its rise is driven directly off this
      // ScrollTrigger's own 0→1 `progress`, which GSAP always completes
      // correctly regardless of how much scroll room the rest of the
      // page happens to have left. The pin distance below (a flat 500px)
      // no longer needs to match anything about the footer at all — it
      // only controls how much scroll gesture the rise takes to play
      // out, exactly like any other scrubbed animation.
      let footerTrigger;
      const footer = document.querySelector(".footer");
      if (footer && !prefersReducedMotion) {
        gsap.set(footer, {
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100%",
          yPercent: 100,
          zIndex: 1000,
        });

        footerTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=500",
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            gsap.set(footer, { yPercent: 100 - 100 * self.progress });
          },
          onLeave: () => {
            // Pin has released — hand the footer back to normal document
            // flow so it becomes the actual last thing on the page
            // (reachable, contributes real height, scrolls normally)
            // instead of staying fixed on screen forever.
            gsap.set(footer, {
              clearProps: "position,left,bottom,width,zIndex,transform",
            });
          },
          onEnterBack: () => {
            // Scrolling back up into this section's pin range: put the
            // footer back into the fixed overlay layer so it can resume
            // tracking this trigger's progress (onUpdate) correctly.
            gsap.set(footer, {
              position: "fixed",
              left: 0,
              bottom: 0,
              width: "100%",
              zIndex: 1000,
            });
          },
        });
      }

      return () => {
        window.removeEventListener("resize", handleResize);
        trigger?.kill();
        footerTrigger?.kill();
        // Footer is mounted globally (layout.tsx) and outlasts this
        // section — without resetting it here, navigating away from
        // the homepage would leave it permanently fixed/translated on
        // every other page instead of back in normal document flow.
        if (footer) {
          gsap.set(footer, {
            clearProps: "position,left,bottom,width,transform,zIndex",
          });
        }
      };
    }, section);

    return () => ctx.revert();
  }, [images]);

  return (
    <section className="image-orbit" ref={sectionRef}>
      <div className="heading-before-footer">
        <h2>{heading}</h2>
        <p>{subheading}</p>
      </div>

      {images.map((image, index) => (
        <div className="orbit-card" ref={addCardRef} key={image.src ?? index}>
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </section>
  );
}
