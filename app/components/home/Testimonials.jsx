"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/testimonials.css";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    id: 1,
    video: "/Metro_compressed.mp4",
    name: "Metro Jewellers",
    tags: ["JEWELRY", "E-COMMERCE", "BRANDING"],
    ctaLabel: "Watch Testimonials",
    href: "#",
    poster: "#",
  },
  {
    id: 2,
    video: "/Zeds_compressed.mp4",
    name: "Zeds Perfumes",
    tags: ["PERFUME", "E-COMMERCE"],
    ctaLabel: "Watch Testimonials",
    href: "https://zedsperfumes.com/",
    poster: "#",
  },
  {
    id: 3,
    video: "/Wellington_compressed.mp4",
    name: "Wellington Properties",
    tags: ["REAL ESTATE", "UI/UX", "NEXT.JS"],
    ctaLabel: "Watch Testimonials",
    href: "https://wellingtonre.com/",
    poster: "#",
  },
  {
    id: 4,
    video: "/AFY_compressed.mp4",
    name: "AFY Realty",
    tags: ["REAL ESTATE", "BRANDING", "WEB"],
    ctaLabel: "Watch Testimonials",
    href: "https://afygroup.ae/",
    poster: "#",
  },
  {
    id: 5,
    video: "/SanamCars_compressed.mp4",
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

export default function Testimonials() {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const leftHeadRef = useRef(null);
  const rightHeadRef = useRef(null);
  const centerHeadRef = useRef(null);
  const leftIntroRef = useRef(null);
  const leftCounterRef = useRef(null);
  const rightIntroRef = useRef(null);
  const rightCounterRef = useRef(null);

  cardRefs.current = [];
  const registerCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) cardRefs.current.push(el);
  };

  useEffect(() => {
    const rootEl = rootRef.current;
    const totalTestimonials = cardRefs.current.length;
    // Guards the deferred rAF poll further down (navbar darken tween) in
    // case this component unmounts before .nav-bar/.menu-dropdown are found.
    let cancelled = false;

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

    const getPosition = (index) =>
      CARD_POSITIONS[
        (index - state.currentIndex + cardRefs.current.length) %
          cardRefs.current.length
      ];

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
      const counterOffsetX = window.innerWidth <= 1500 ? 120 : 50;

      introTl
        .to(
          leftHeadRef.current,
          { xPercent: -200, ease: "none", color: "#000" },
          0,
        )
        .to(
          rightHeadRef.current,
          { xPercent: 200, ease: "none", color: "#000" },
          0,
        )
        .to(
          centerHeadRef.current,
          { scale: 0.5, yPercent: 130, color: "#000" },
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
        )
        .to(document.body, { background: "#fff" }, 0.5);

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
        if (cancelled) return;
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
      ctx.revert(); // kills all tweens/ScrollTriggers created above, including
      // the navbar tween — this reverts .nav-bar/.menu-dropdown's
      // backgroundColor inline style back to whatever it was before, same
      // as document.body below (gsap.context tracks a tween by creation,
      // not by which element it targets, so it's covered even though
      // .nav-bar lives outside rootRef's subtree).
      gsap.set(document.body, { clearProps: "background" }); // don't leak white bg to other routes
    };
  }, []);

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

      {TESTIMONIALS.map((t) => (
        <div className="testimonial-card" key={t.id} ref={registerCardRef}>
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
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            poster={t.poster !== "#" ? t.poster : undefined}
          >
            <source src={t.video} type="video/mp4" />
          </video>
        </div>
      ))}
    </div>
  );
}
