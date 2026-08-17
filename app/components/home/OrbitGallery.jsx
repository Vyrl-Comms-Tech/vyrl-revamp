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
      // section in the DOM) rises up and covers this section, which
      // itself stays pinned in place (not scrolling normally) while it
      // scales down and fades — the section holds still on screen and
      // the footer comes to it, rather than the two just scrolling past
      // each other.
      //
      // The footer is deliberately left in normal document flow the
      // entire time (never position: fixed) — an earlier version here
      // switched it to fixed for the pin's duration and back to relative
      // on release, but reconciling those two positioning systems at the
      // exact handoff instant was fragile: the two disagreed on where
      // the footer visually was by a full viewport height, producing a
      // hard jump right as the pin released, and since the footer being
      // fixed removed its height from the document during that window,
      // the page had less real scroll room left than the pin needed —
      // the handoff could never fully finish; the footer got stuck
      // partway up with no more page left to scroll.
      //
      // Leaving it in flow sidesteps both problems at once: the footer
      // simply scrolls up under normal document flow like every other
      // section, contributing its own real height to the page the whole
      // time (so the pin's reserved distance is always exactly enough,
      // no reconciliation needed) — pinning *this* section (below) is
      // what makes that scroll-up read as the footer actively rising
      // over it, since the section holds still on screen while the
      // footer's own normal scroll carries it upward into view. A
      // z-index above this section's own stacking (see orbit-gallery.css:
      // .heading-before-footer is 900, .orbit-card scales up to ~800) is
      // still needed so the footer visually covers the content instead
      // of sliding in underneath it.
      let footerTrigger;
      const footer = document.querySelector(".footer");
      if (footer && !prefersReducedMotion) {
        gsap.set(footer, { position: "relative", zIndex: 1000 });

        // Pinned for exactly the footer's own height worth of extra
        // scroll — that's how much scroll distance the footer actually
        // needs to travel from "just below the viewport" to "fully in
        // place" while this section holds still underneath it. Using
        // the footer's real height (rather than a fixed guess like
        // "+=100%") keeps the reserved distance exactly matched to how
        // far it truly has to travel, so the handoff always completes
        // by the time the user reaches the real bottom of the page.
        const footerHeight = footer.getBoundingClientRect().height;

        footerTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${footerHeight}`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(section, {
              scale: 1 - 0.08 * p,
              opacity: 1 - 0.4 * p,
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
        // the homepage would leave its z-index permanently bumped above
        // every other page's content.
        if (footer) {
          gsap.set(footer, { clearProps: "position,zIndex" });
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
