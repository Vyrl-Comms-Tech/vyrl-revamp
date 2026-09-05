"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/testimonials.css";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    id: 1,
    video: "/v1 (1).mp4",
    name: "Metro Jewellers",
    tags: ["JEWELRY", "E-COMMERCE", "BRANDING"],
    ctaLabel: "Watch Testimonials",
    href: "#",
    poster: "#",
  },
  {
    id: 2,
    video: "/v1 (5).mp4",
    name: "Zeds Perfumes",
    tags: ["PERFUME", "E-COMMERCE"],
    ctaLabel: "Watch Testimonials",
    href: "https://zedsperfumes.com/",
    poster: "#",
  },
  {
    id: 3,
    video: "/v1 (4).mp4",
    name: "Wellington Properties",
    tags: ["REAL ESTATE", "UI/UX", "NEXT.JS"],
    ctaLabel: "Watch Testimonials",
    href: "https://wellingtonre.com/",
    poster: "#",
  },
  {
    id: 4,
    video: "/v1 (3).mp4",
    name: "AFY Realty",
    tags: ["REAL ESTATE", "BRANDING", "WEB"],
    ctaLabel: "Watch Testimonials",
    href: "https://afygroup.ae/",
    poster: "#",
  },
  {
    id: 5,
    video:"/v1 (2).mp4",
    name: "Sanam Cars",
    tags: ["AUTOMOTIVE", "GSAP", "ScrollTrigger"],
    ctaLabel: "Watch Testimonials",
    href: "https://sanamcars.com/",
    poster: "#",
  },
];

// Slot offsets (xPercent) relative to the active card. Only the first
// N entries (N = testimonial count) are ever consumed, via modulo.
const CARD_POSITIONS = [-140, -120, 0, 120, 140, 210];
const CENTER_POSITION_INDEX = CARD_POSITIONS.indexOf(0);

export default function Testimonials() {
  // Testimonials is rendered on both / (home, white body) and /services
  // (via ResponsiveSwap right after Services3d — see services/page.jsx),
  // where Slider.jsx has already flipped document.body to black to hand
  // off into Services3d's own black background. The intro tween below
  // normally fades document.body back to white partway through — correct
  // on home, but on /services that would stomp the black Slider/
  // Services3d just established. Gate it on pathname so /services keeps
  // its black straight through instead.
  const pathname = usePathname();
  const isServicesPage = pathname === "/services";
  // On /projects, ProjectsGrid.jsx fades document.body to white over its
  // own last stretch of scroll, landing fully white before this section
  // even starts (see ProjectsGrid.jsx's body-color effect) — unlike home,
  // where the page starts white from the very top and these headings'
  // white-on-black -> black-on-white timing is tuned to track that first
  // scroll-in. Arriving here with the page already white but these
  // headings still at their white CSS default (see testimonials.css)
  // read as invisible white-on-white until introTl's own scroll position
  // caught up and darkened them. Set black immediately instead of
  // animating on this route.
  const isProjectsPage = pathname === "/projects";
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const leftHeadRef = useRef(null);
  const rightHeadRef = useRef(null);
  const centerHeadRef = useRef(null);
  const leftIntroRef = useRef(null);
  const leftCounterRef = useRef(null);
  const rightIntroRef = useRef(null);
  const rightCounterRef = useRef(null);
  const videoRefs = useRef([]);
  // One shared muted flag, not per-card — mirrors ClientReviews.jsx's
  // mute button: a "sound on or off" toggle that applies to whichever
  // card is currently centered, carrying over as the deck rotates. Only
  // the centered card's <video> is ever actually unmuted (see syncAudio
  // below) — every other card stays muted regardless of this flag, so
  // unmuting doesn't play every video's audio at once.
  const [isMuted, setIsMuted] = useState(true);
  // Mirrors isMuted for the GSAP effect below, which only runs once on
  // mount and reads this on every slide change rather than closing over
  // a stale isMuted from its first render.
  const isMutedRef = useRef(isMuted);
  // Set inside the GSAP effect below to the real syncAudio() (which knows
  // the true current center via state.currentIndex) — called here too so
  // toggling the button takes effect immediately instead of waiting for
  // the next slide change.
  const syncAudioRef = useRef(null);
  useEffect(() => {
    isMutedRef.current = isMuted;
    syncAudioRef.current?.();
  }, [isMuted]);

  useEffect(() => {
    const rootEl = rootRef.current;
    const totalTestimonials = cardRefs.current.length;
    // Guards the deferred rAF poll further down (navbar darken tween) in
    // case this component unmounts before .nav-bar/.menu-dropdown are found.
    let cancelled = false;

    // See isProjectsPage's comment above: on /projects the page is
    // already white by the time this section mounts, so these headings
    // need to already be black too — set immediately rather than waiting
    // for introTl's scroll-linked color tween further down (which is
    // skipped entirely on this route, same as isServicesPage skips it
    // for the opposite reason).
    if (isProjectsPage) {
      gsap.set(
        [leftHeadRef.current, rightHeadRef.current, centerHeadRef.current],
        { color: "#000" },
      );
    }

    // Mutable slider state — kept in a plain object (not React state) on
    // purpose: this drives GSAP tweens on every drag/autoplay tick, and
    // routing it through React state would fight the animation loop.
    const state = {
      currentIndex: 0,
      testimonialCounter: 1,
      isAnimating: false,
      autoplay: null,
      startX: 0,
      startY: 0,
    };

    // state.currentIndex is the actual centered testimonial. Offset the
    // circular position lookup by the slot containing xPercent: 0 so the
    // visible center, counter, and audio all refer to the same card.
    const getPosition = (index) =>
      CARD_POSITIONS[
        (index - state.currentIndex + CENTER_POSITION_INDEX +
          cardRefs.current.length) %
          cardRefs.current.length
      ];

    // Silences every card except the one currently at slot 0 (center) —
    // called on every shift so a card that just left center can never
    // keep playing its audio into the next one. Driven off
    // state.currentIndex directly rather than each card's tweened
    // xPercent (which setCard also checks), since that's the one value
    // that's always exactly correct and available synchronously,
    // independent of animation state.
    const syncAudio = () => {
      cardRefs.current.forEach((card, index) => {
        const video = card.querySelector("video");
        if (!video) return;
        video.muted = index === state.currentIndex ? isMutedRef.current : true;
      });
    };
    syncAudioRef.current = syncAudio;

    const setCard = (card, x, animate = true) => {
      let opacity = 0.5;
      let scale = 0.85;
      let blur = 5;
      let zIndex = 1;

      if (x === 0) {
        opacity = 1;
        scale = 1;
        blur = 0;
        zIndex = 5;
      }

      if (Math.abs(x) >= 140) {
        opacity = 0;
        scale = 0.7;
        blur = 10;
        zIndex = 0;
      }

      gsap.to(card, {
        xPercent: x,
        opacity,
        scale,
        filter: `blur(${blur}px)`,
        zIndex,
        duration: animate ? 0.7 : 0,
        ease: "power3.inOut",
      });

      const content = card.querySelector(".card-inner-testi");
      if (!content) return;

      gsap.to(content, {
        yPercent: x === 0 ? 0 : 30,
        opacity: x === 0 ? 1 : 0,
        duration: animate ? 0.5 : 0,
        delay: x === 0 && animate ? 0.2 : 0,
        ease: "power3.out",
      });
    };

    const showCounter = (number) => {
      const value = String(number).padStart(2, "0");

      gsap.killTweensOf([
        rightIntroRef.current,
        rightCounterRef.current,
        leftIntroRef.current,
        leftCounterRef.current,
      ]);

      // LEFT: WHAT -> 06
      gsap.to(leftIntroRef.current, {
        yPercent: -100,
        opacity: 0,
        duration: 0.35,
        ease: "power3.inOut",
      });

      gsap.fromTo(
        leftCounterRef.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      );

      // RIGHT: SAYS -> NUMBER
      gsap.to(rightIntroRef.current, {
        yPercent: -100,
        opacity: 0,
        duration: 0.35,
        ease: "power3.inOut",
      });

      rightCounterRef.current.textContent = value;

      gsap.fromTo(
        rightCounterRef.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      );
    };

    const stopAutoplay = () => {
      if (state.autoplay) {
        state.autoplay.kill();
        state.autoplay = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      const loop = () => {
        nextSlide();
        state.autoplay = gsap.delayedCall(4, loop);
      };
      state.autoplay = gsap.delayedCall(4, loop);
    };

    const nextSlide = () => {
      if (state.isAnimating) return;
      state.isAnimating = true;

      state.currentIndex++;
      if (state.currentIndex >= cardRefs.current.length) state.currentIndex = 0;

      state.testimonialCounter++;
      if (state.testimonialCounter > totalTestimonials)
        state.testimonialCounter = 1;

      rightCounterRef.current.textContent = String(
        state.testimonialCounter,
      ).padStart(2, "0");

      gsap.fromTo(
        rightCounterRef.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      );

      cardRefs.current.forEach((card, index) =>
        setCard(card, getPosition(index), true),
      );
      syncAudio();

      gsap.delayedCall(0.7, () => {
        state.isAnimating = false;
      });
    };

    const prevSlide = () => {
      if (state.isAnimating) return;
      state.isAnimating = true;

      state.currentIndex--;
      if (state.currentIndex < 0)
        state.currentIndex = cardRefs.current.length - 1;

      state.testimonialCounter--;
      if (state.testimonialCounter < 1)
        state.testimonialCounter = totalTestimonials;

      rightCounterRef.current.textContent = String(
        state.testimonialCounter,
      ).padStart(2, "0");

      gsap.fromTo(
        rightCounterRef.current,
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
      );

      cardRefs.current.forEach((card, index) =>
        setCard(card, getPosition(index), true),
      );
      syncAudio();

      gsap.delayedCall(0.7, () => {
        state.isAnimating = false;
      });
    };

    // ==========================================================
    // DRAG
    // ==========================================================
    const handlePointerDown = (e) => {
      state.startX = e.clientX;
      state.startY = e.clientY;
      stopAutoplay();
    };

    const handlePointerUp = (e) => {
      const diffX = e.clientX - state.startX;
      const diffY = e.clientY - state.startY;

      if (Math.abs(diffY) > Math.abs(diffX)) {
        startAutoplay();
        return;
      }

      if (diffX < -60) nextSlide();
      else if (diffX > 60) prevSlide();

      startAutoplay();
    };

    rootEl.addEventListener("pointerdown", handlePointerDown);
    rootEl.addEventListener("pointerup", handlePointerUp);

    // gsap.context scopes every tween/ScrollTrigger created inside to this
    // component and guarantees clean teardown on unmount (App Router safe).
    const ctx = gsap.context(() => {
      // ---- Initial card positions (no animation) ----
      cardRefs.current.forEach((card, index) =>
        setCard(card, getPosition(index), false),
      );
      syncAudio();

      // ==========================================================
      // SCROLLTRIGGER INTRO
      // ==========================================================
      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: rootEl,
          start: "top center",
          end: "90% bottom",
          scrub: 1,
          //   markers:true,

          onLeave: () => {
            // Intro finished — reveal the counter layers, start the deck.
            showCounter(1);
            state.testimonialCounter = 1;
            startAutoplay();
          },

          onEnterBack: () => {
            stopAutoplay();
          },

          onLeaveBack: () => {
            stopAutoplay();

            gsap.to(leftIntroRef.current, {
              yPercent: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
            });
            gsap.to(leftCounterRef.current, {
              yPercent: 100,
              opacity: 0,
              duration: 0.5,
              ease: "power3.out",
            });
            gsap.to(rightIntroRef.current, {
              yPercent: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
            });
            gsap.to(rightCounterRef.current, {
              yPercent: 100,
              opacity: 0,
              duration: 0.5,
              ease: "power3.out",
            });

            state.testimonialCounter = 1;
          },
        },
      });

      // Counter resting x-offset from center: wider on laptop-range
      // screens (<=1500px) than on desktop, since the card and heading
      // both scale down relative to viewport there — a flat 50px reads
      // as too close to the card at that size.
      const counterOffsetX = window.innerWidth <= 1500 ? 60 : 40;

      // WHAT / CLIENTS / SAYS rest white by default (see testimonials.css)
      // and tween to black here so they stay legible once document.body
      // fades to white further down this same timeline. On /services
      // that body-white tween is skipped and the page stays black (see
      // the isServicesPage guards on document.body above/below), so
      // forcing these headings to black there would bury them against
      // that same black — leave them at their default white instead by
      // skipping the color tween on this route.
      //
      // On /projects these still tween color: "#000" — harmless no-op
      // there, since isProjectsPage's gsap.set() above already set them
      // black before this timeline was even created.
      introTl
        .to(
          leftHeadRef.current,
          {
            xPercent: -200,
            ease: "none",
            ...(isServicesPage ? {} : { color: "#000" }),
          },
          0,
        )
        .to(
          rightHeadRef.current,
          {
            xPercent: 200,
            ease: "none",
            ...(isServicesPage ? {} : { color: "#000" }),
          },
          0,
        )
        .to(
          centerHeadRef.current,
          {
            scale: 0.5,
            yPercent: 130,
            ...(isServicesPage ? {} : { color: "#000" }),
          },
          0.4,
        )
        .to(
          leftHeadRef.current,
          {
            yPercent: 0,
            y: "48vh",
            xPercent: 30,
            x: -counterOffsetX,
            scale: 0.5,
            ease: "none",
          },
          0.5,
        )
        .to(
          rightHeadRef.current,
          {
            yPercent: 0,
            y: "48vh",
            xPercent: -14,
            x: counterOffsetX,
            scale: 0.5,
            ease: "none",
          },
          0.5,
        );

      // On /services, Slider.jsx has already flipped document.body to
      // black and darkened the navbar to hand off into Services3d's own
      // black background (see services/page.jsx) — skip both tweens
      // there so this intro doesn't fade things back to white/light
      // partway through and undo that handoff. Home is the only route
      // that needs this fade (its body starts white and has nothing
      // upstream turning it black).
      if (!isServicesPage) {
        introTl.to(document.body, { "--bodybg": "#fff" }, 0.5);
      }

      // Once document.body fades to white above, .nav-bar/.menu-dropdown's
      // own resting translucent-white background (see navbar.css) all but
      // disappears against it — same problem HeroModelSection.jsx and
      // Work.jsx already fix for their own background swaps, solved the
      // same way here: darken the navbar to solid black in the same
      // scrub, at the same "0.5" position the body itself turns white.
      //
      // Added separately (not chained into the .to() sequence above) and
      // polled for briefly first: GSAP resolves an element/selector
      // target once, synchronously, when it's added to the timeline —
      // .nav-bar/.menu-dropdown live in a sibling component (Navbar.jsx)
      // that isn't guaranteed to have mounted yet at this exact moment.
      let attempts = 0;
      const addNavbarDarkenTween = () => {
        if (cancelled || isServicesPage) return;
        const navBar = document.querySelector(".nav-bar");
        const menuDropdown = document.querySelector(".menu-dropdown");
        if (navBar && menuDropdown) {
          introTl.to(
            [navBar, menuDropdown],
            { backgroundColor: "#0a0a0a", ease: "power2.inOut" },
            0.5,
          );
          return;
        }
        attempts += 1;
        if (attempts < 30) requestAnimationFrame(addNavbarDarkenTween);
      };
      addNavbarDarkenTween();

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      cancelled = true; // guards the deferred rAF poll above if unmount beats it
      rootEl.removeEventListener("pointerdown", handlePointerDown);
      rootEl.removeEventListener("pointerup", handlePointerUp);
      stopAutoplay();
      syncAudioRef.current = null;
      ctx.revert(); // kills all tweens/ScrollTriggers created above, including
      // the navbar tween — this reverts .nav-bar/.menu-dropdown's
      // backgroundColor inline style back to whatever it was before, same
      // as document.body below (gsap.context tracks a tween by creation,
      // not by which element it targets, so it's covered even though
      // .nav-bar lives outside rootRef's subtree).
      //
      // Only clear document.body here if this effect actually set it —
      // on /services the white-fade tween above was skipped, so the
      // black inline background on document.body at this point belongs
      // to Slider.jsx (see services/page.jsx), not this component;
      // clearing it here would strip that black out from under it.
      if (!isServicesPage) {
        gsap.set(document.body, { clearProps: "--bodybg" }); // don't leak white bg to other routes
      }
    };
  }, [isServicesPage, isProjectsPage]);

  return (
    <div className="clients-testimonial" ref={rootRef}>
      <div className="heading-testimonial">
        <div className="left-head" ref={leftHeadRef}>
          <span className="intro-text" ref={leftIntroRef}>
            WHAT
          </span>
          <span className="counter-text" ref={leftCounterRef}>
            06
          </span>
        </div>

        <div className="center-head" ref={centerHeadRef}>
          CLIENTS
        </div>

        <div className="right-head" ref={rightHeadRef}>
          <span className="intro-text" ref={rightIntroRef}>
            SAYS
          </span>
          <span className="counter-text" ref={rightCounterRef}>
            01
          </span>
        </div>
      </div>

      {TESTIMONIALS.map((t, index) => (
        <div
          className="testimonial-card"
          key={t.id}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
        >
          <div className="card-inner-testi">
            <h2>

            {t.name}
            </h2>
            <div className="testimonial-tags">
              {t.tags.map((tag) => (
                <span className="testimonial-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <a
              className="testimonial-cta"
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.ctaLabel}
            </a>
          </div>
          <video
            ref={(el) => {
              videoRefs.current[t.id] = el;
            }}
            // Starts muted like every card; syncAudio (in the effect
            // above) takes over from here, keeping only the centered
            // card's video in sync with isMuted and every other card
            // hard-muted.
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            poster={t.poster !== "#" ? t.poster : undefined}
          >
            <source src={t.video} type="video/mp4" />
          </video>
          <button
            type="button"
            className="testimonial-mute-btn"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            // The root .clients-testimonial element listens for
            // pointerdown/pointerup natively (drag-to-swipe) — stop them
            // here too, not just click, so pressing this button doesn't
            // also register as a drag gesture / restart autoplay.
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              // Only ever affects the centered card's video — syncAudio
              // hard-mutes every non-centered card regardless of
              // isMuted, so flipping this flag alone can't leak audio
              // into the rest of the deck.
              setIsMuted((m) => !m);
            }}
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 9v6h4l5 5V4L8 9H4z" fill="white" />
                <path d="M16 8.5L21 15.5M21 8.5L16 15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 9v6h4l5 5V4L8 9H4z" fill="white" />
                <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M19 6a8.5 8.5 0 0 1 0 12" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
