"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/orbit-gallery.css";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { caseStudies } from "../caseStudy/caseStudiesData";
import FooterContent from "../layout/FooterContent";
// import { isKnownRoute } from
import "../../styles/footer.css";
import { isKnownRoute } from "../layout/knownRoutes";
import VyrlCtaButton from "../layout/VyrlCtaButton";
// import PageTransitionLink from "./PageTransitionLink";

const CASE_STUDY_PATHS = Object.values(caseStudies).map((c) => c.href);
const NO_FOOTER_PATHS = [...CASE_STUDY_PATHS, "/contact-us"];

gsap.registerPlugin(ScrollTrigger);
// orbit(1).avif
const DEFAULT_IMAGES = [
  { src: "orbit(1).avif", alt: "Collective member 1" },
  { src: "orbit(2).avif", alt: "Collective member 2" },
  { src: "orbit(4).avif", alt: "Collective member 4" },
  { src: "orbit(5).avif", alt: "Collective member 5" },
  { src: "orbit(18).avif", alt: "Collective member 3" },
  { src: "orbit(6).avif", alt: "Collective member 6" },
  { src: "orbit(7).avif", alt: "Collective member 7" },
  { src: "orbit(10).avif", alt: "Collective member 8" },
  //   { src: "banda4.avif", alt: "Collective member 9" },
  { src: "orbit(11).avif", alt: "Collective member 10" },
  { src: "orbit(12).avif", alt: "Collective member 11" },
  { src: "orbit(13).avif", alt: "Collective member 12" },
  //   { src: "jeikor4.avif", alt: "Collective member 13" },
  { src: "orbit(14).avif", alt: "Collective member 14" },
  { src: "orbit(15).avif", alt: "Collective member 15" },
  { src: "orbit(16).avif", alt: "Collective member 16" },
  { src: "orbit(17).avif", alt: "Collective member 17" },
];

const MOBILE_BREAKPOINT = 800;
// Desktop's 540/320 orbit radius reads oversized on laptop-range
// screens (the ring pushes cards close to/past the viewport edge at
// narrower widths still above the mobile breakpoint) — this tier scales
// it down, roughly the midpoint between mobile's 220/190 and desktop's
// 540/320, same "laptop gets its own smaller-than-desktop step" pattern
// Testimonials.jsx's counterOffsetX uses at the same 1500px cutoff.
const LAPTOP_BREAKPOINT = 1500;
const COMPACT_LAPTOP_BREAKPOINT = 1300;
const VELOCITY_TO_RADIANS = 0.00003;

export default function OrbitGallery({
  images = DEFAULT_IMAGES,
  heading = "The Collective Behind Every Experience",
  subheading = "Built by a collective of thinkers, makers, developers, creators, and growth specialists, all working together to turn bold ideas into digital systems that perform",
}) {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

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

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    // The two pieces of motion here are independent: the orbit cards'
    // continuous scroll-driven rotation (kept on mobile too — it's
    // wanted there), and the pin timeline that reveals .footer over the
    // cards as the section is pinned (skipped on mobile — see the
    // max-width: 800px override in orbit-gallery.css/footer.css that
    // puts .footer in its plain static resting position there instead
    // of the translateY(100%) it starts at for the desktop reveal, so
    // there's nothing left for a pin to animate into place).
    const skipOrbitRotation = prefersReducedMotion;
    const skipPin = prefersReducedMotion || isMobile;

    const ctx = gsap.context(() => {
      let orbitProgress = 0;
      let orbitRadiusX = getRadiusX();
      let orbitRadiusY = getRadiusY();
      const cardCount = cards.length;

      function getRadiusX() {
        if (window.innerWidth < MOBILE_BREAKPOINT) return 220;
        if (window.innerWidth <= COMPACT_LAPTOP_BREAKPOINT) return 460;
        if (window.innerWidth <= LAPTOP_BREAKPOINT) return 550;
        return 540;
      }
      function getRadiusY() {
        if (window.innerWidth < MOBILE_BREAKPOINT) return 190;
        if (window.innerWidth <= COMPACT_LAPTOP_BREAKPOINT) return 230;
        if (window.innerWidth <= LAPTOP_BREAKPOINT) return 245;
        return 320;
      }

      // Driven by the pin timeline below, 1 → 0 as it scrubs through.
      // updateOrbit() folds it into each card's own depth-based
      // scale/opacity/position instead of the pin tweening those same
      // properties on .orbit-card directly with a separate .to() —
      // two GSAP writers touching scale/opacity on the same elements on
      // the same frames is what used to freeze the rotation (the old
      // fix just stopped calling updateOrbit() for the pin's duration,
      // which stopped the rotation outright instead of blending the
      // two). With only one writer, the cards keep orbiting the whole
      // time while visibly shrinking/fading/rising away on top of it.
      const cardExit = { value: 0 };

      function updateOrbit() {
        const exit = cardExit.value;
        cards.forEach((card, index) => {
          const angle = orbitProgress + (index / cardCount) * Math.PI * 2;
          const x = Math.cos(angle) * orbitRadiusX;
          const y = Math.sin(angle) * orbitRadiusY;

          const depth = (Math.sin(angle) + 1) / 2;
          const scale = (0.92 + depth * 0.24) * (1 - exit);
          const opacity = (0.45 + depth * 0.95) * (1 - exit);
          const zIndex = Math.round(depth * 800);

          gsap.set(card, {
            x,
            y: y - exit * orbitRadiusY, // drifts upward as it exits
            xPercent: -50,
            yPercent: -50,
            scale,
            opacity,
            filter: `blur(${exit * 12}px)`,
            zIndex,
          });
        });
      }

      updateOrbit();

      let trigger;
      if (!skipOrbitRotation) {
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
        // SmoothScroll owns the debounced global refresh after zoom/resize.
        // Refreshing here for every intermediate zoom event could rebuild
        // this section's active pin spacer repeatedly and corrupt its DOM.
      };

      window.addEventListener("resize", handleResize);

      // Pins .image-orbit itself in place for an extra 110% of the
      // viewport height of scroll before releasing, so the section (and
      // the footer riding along inside it, absolutely positioned at its
      // bottom) holds on screen long enough for that overlap to read
      // clearly instead of scrolling straight past. One timeline, one
      // scrollTrigger driving both steps together — the footer rises
      // while the orbit cards shrink/fade/rise away, still actively
      // orbiting the whole time (see cardExit/updateOrbit above).
      // Skipped on mobile — see skipPin above — so the section renders
      // as one normal, unpinned block there (orbit rotation still runs).
      let pinTimeline;
      if (!skipPin) {
        pinTimeline = gsap.timeline({
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
            // "border-top-left-radius": "30px",
            // "border-top-right-radius": "30px",
            ease: "none",
          })
          // .heading-before-footer isn't part of the orbit system, so
          // it keeps a plain .to(). The orbit cards themselves are
          // driven by cardExit (see updateOrbit) instead of being
          // tweened directly here, so their rotation never stops.
          .to(
            ".heading-before-footer",
            {
              yPercent: -100,
              scale: 0,
              opacity: 0,
              filter: "blur(12px)",
              ease: "power2.in",
            },
            "<",
          )
          .to(
            cardExit,
            {
              value: 1,
              ease: "power2.in",
              onUpdate: updateOrbit,
            },
            "<",
          );
      }

      // This section sits far down the page, after several other pinned
      // sections (Services3d, Work, Testimonials, ...) whose own
      // pin-spacers can still be settling into their final reserved
      // height at the moment this ScrollTrigger is created — same class
      // of bug Work.jsx and PartnersSection.jsx both document/fix for
      // themselves. Without this, "top top"/"+=110%" above gets measured
      // against a page that hasn't finished growing yet, so the pin can
      // activate at the wrong scroll offset — which is what shows up as
      // .footer already revealed/overlapping the orbit cards on load
      // instead of staying hidden below them until you actually scroll
      // here. One rAF only guarantees a repaint; a second gives every
      // earlier pin-spacer one more full frame to finish settling before
      // this measures anything.
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
        window.removeEventListener("resize", handleResize);
        trigger?.kill();
        pinTimeline?.scrollTrigger?.kill();
        pinTimeline?.kill();
      };
    }, section);

    return () => ctx.revert();
  }, [images]);
  const pathname = usePathname();
  const hideFooter =
    NO_FOOTER_PATHS.includes(pathname) || !isKnownRoute(pathname);
  if (hideFooter) return null;
  return (
    <section className="image-orbit" ref={sectionRef}>
      <div className="heading-before-footer">
        <h2>{heading}</h2>
        <p>{subheading}</p>

        <span>
          <VyrlCtaButton
            label="Explore Services"
            href="/services"
            className="vyrl-cta--solid"
          />
        </span>
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
      <footer
        id="footer-mble-hide"
        className={`footer${pathname === "/projects" ? " footer--no-radius" : ""}`}
      >
      <FooterContent />
      </footer>
    </section>
  );
}
