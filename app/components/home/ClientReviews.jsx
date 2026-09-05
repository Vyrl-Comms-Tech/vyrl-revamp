"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextAnimation from "./TextAnimation";
import ChangeTextAnimation from "../layout/ChangeTextAnimation";
import "../../styles/client-review.css";
import CtaButton from "../layout/cta";
import VyrlCtaButton from "../layout/VyrlCtaButton";

// Registering a browser-only plugin at module scope would break SSR
// (Next renders client components on the server too) — guard it.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Base (desktop, >1620px) card geometry. width/height/x/y scale down at
// smaller breakpoints via getResponsiveScale(); rotate/zIndex/opacity don't
// need to change with viewport size, so they stay fixed here.
const BASE_POSITIONS = [
  {
    x: -200,
    y: 40,
    rotate: -14,
    zIndex: 1,
    width: 280,
    height: 470,
    opacity: 1,
  },
  {
    x: -100,
    y: 20,
    rotate: -9,
    zIndex: 2,
    width: 330,
    height: 520,
    opacity: 1,
  },
  { x: 0, y: 0, rotate: 0, zIndex: 5, width: 390, height: 600, opacity: 1 },
  { x: 100, y: 20, rotate: 9, zIndex: 2, width: 330, height: 520, opacity: 1 },
  { x: 200, y: 40, rotate: 14, zIndex: 1, width: 280, height: 470, opacity: 1 },
];

function getResponsiveScale(viewportWidth) {
  if (viewportWidth <= 640) return 0.60;
  if (viewportWidth <= 1720) return 0.78;
  return 1;
}

// Side cards' x offset needs to shrink faster than their size on small
// screens, or they push past the viewport edge — at 0.55x size-scale,
// a 200px base offset still lands ~110px from center, which overflows
// a narrow phone. Pull them in further on top of the size scale.
function getOffsetScale(viewportWidth) {
  if (viewportWidth <= 640) return 0.85;
  if (viewportWidth <= 1620) return 0.85;
  return 1;
}

function getPositions(viewportWidth) {
  const scale = getResponsiveScale(viewportWidth);
  const offsetScale = getOffsetScale(viewportWidth);
  return BASE_POSITIONS.map((p) => ({
    ...p,
    x: p.x * scale * offsetScale,
    y: p.y * scale,
    width: p.width * scale,
    height: p.height * scale,
  }));
}

const REVIEWS = [
  {
    id: 1,
    video: "/Metro_compressed.mp4",
    name: "Metro Jewellers",
    tags: ["JEWELRY", "E-COMMERCE", "BRANDING"],
    ctaLabel: "Watch Testimonials",
    href: "#",
    poster: "/Metro_compressed-frame.avif",
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
    poster: "/AFY_compressed-frame.avif",
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

const N = 5;

function ClientReviewSection() {
  // Rendered on both / (home, white body) and /services (via
  // ResponsiveSwap right after Services3d — see services/page.jsx),
  // where the page is already black by the time this section arrives
  // (Slider.jsx flips document.body black going in, and every section
  // since holds it — see Testimonials.jsx's identical isServicesPage
  // guard, which this mirrors for the mobile variant of the same slot).
  // The colorTl below normally fades this section's own white-on-black
  // resting state to black-on-white as it scrolls to center — correct
  // on home, but on /services that would fight the black-bg/white-text
  // scheme this page is already committed to. Gate it off there so
  // /services stays black-bg/white-text straight through.
  const pathname = usePathname();
  const isServicesPage = pathname === "/services";
  const cardRefs = useRef([]);
  const videoRefs = useRef([]);
  const offsetRef = useRef(0);
  const animating = useRef(false);
  const dragStartX = useRef(0);
  const dragging = useRef(false);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const shiftRef = useRef(null);
  const positionsRef = useRef(
    getPositions(typeof window !== "undefined" ? window.innerWidth : 1920),
  );
  const [activeIndex, setActiveIndex] = useState(2);
  // The two stickers anchor to the center card slot and swap diagonal
  // corners on every shift — "tl-br" places sticker1 top-left/sticker2
  // bottom-right, "tr-bl" flips both to the opposite corner. Independent
  // of which review is showing; it just alternates each time an arrow
  // is clicked.
  const [stickerCorner, setStickerCorner] = useState("tl-br");
  // Tags shown lag one animation cycle behind activeIndex: on change, the
  // currently-displayed tags shrink out first, then tagsIndex catches up
  // and the new tags pop in — same shrink/pop choreography as
  // Services3d, staged around a state update rather than an in-place
  // textContent swap, since reviews here have varying tag counts (2-3).
  const [tagsIndex, setTagsIndex] = useState(2);
  const tagsRef = useRef(null);
  // One shared muted flag, not per-card — muting/unmuting is a "sound on
  // or off" toggle for whichever review is currently centered, and that
  // same choice carries over to the next one that rotates into center
  // (rather than each card remembering its own separate mute state).
  const [isMuted, setIsMuted] = useState(true);
  // Flips the CTA button from its white variant to the plain black one
  // as the section's background scrubs to white (see the colorTl
  // ScrollTrigger below) — kept as state rather than a direct GSAP
  // tween since .client-review-cta remounts a fresh CtaButton every
  // time the active review changes.
  const [isCtaDark, setIsCtaDark] = useState(false);

  function posSlot(cardIdx, offset) {
    return (((cardIdx - offset) % N) + N) % N;
  }

  // Only the centered card (activeIndex) can play or emit audio. Mute and
  // pause every side card synchronously before starting the new center;
  // waiting for a side card's play() promise created an audio race during
  // fast switches, where the previous review could still be heard.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === activeIndex) return;

      video.muted = true;
      video.pause();
    });

    const activeVideo = videoRefs.current[activeIndex];
    if (!activeVideo) return;

    activeVideo.muted = isMuted;
    activeVideo.currentTime = 0;
    activeVideo.play().catch(() => {});

    return () => {
      activeVideo.muted = true;
      activeVideo.pause();
    };
  }, [activeIndex, isMuted]);

  useEffect(() => {
    // Guards the deferred rAF poll further down (navbar darken tween) in
    // case this component unmounts before .nav-bar/.menu-dropdown are found.
    let cancelled = false;

    const ctx = gsap.context(() => {
      const els = cardRefs.current;

      // ── set initial positions ──────────────────────────────────────
      els.forEach((el, i) => {
        const p = positionsRef.current[i]; // offset=0 so slot === i
        gsap.set(el, {
          x: p.x,
          y: p.y,
          rotation: p.rotate,
          width: p.width,
          height: p.height,
          zIndex: p.zIndex,
          opacity: p.opacity,
          xPercent: -50,
          yPercent: -50,
        });
      });

      // ── shift ──────────────────────────────────────────────────────
      function shift(direction) {
        if (animating.current) return;
        animating.current = true;

        const tl = gsap.timeline({
          onComplete: () => {
            animating.current = false;
          },
        });

        cardRefs.current.forEach((el, cardIdx) => {
          const currentSlot = posSlot(cardIdx, offsetRef.current);
          const targetSlot = (((currentSlot - direction) % N) + N) % N;

          const pTarget = positionsRef.current[targetSlot];

          tl.to(
            el,
            {
              x: pTarget.x,
              y: pTarget.y,
              rotation: pTarget.rotate,
              width: pTarget.width,
              height: pTarget.height,
              zIndex: pTarget.zIndex,
              opacity: 1,
              duration: 0.55,
              ease: "power3.out",
            },
            0,
          );
        });

        offsetRef.current = (((offsetRef.current + direction) % N) + N) % N;
        const centerCardIdx = (((offsetRef.current + 2) % N) + N) % N;
        setActiveIndex(centerCardIdx);
        setStickerCorner((prev) => (prev === "tl-br" ? "tr-bl" : "tl-br"));
      }

      shiftRef.current = shift;

      // ── pointer drag ───────────────────────────────────────────────
      const container = containerRef.current;

      function snapCenterBack() {
        const centerCard = cardRefs.current.find(
          (_, i) => posSlot(i, offsetRef.current) === 2,
        );
        if (centerCard) {
          gsap.to(centerCard, {
            x: positionsRef.current[2].x,
            rotation: positionsRef.current[2].rotate,
            duration: 0.4,
            ease: "back.out(1.5)",
          });
        }
      }

      // Track where the gesture started and whether we've committed to
      // treating it as a horizontal card-drag yet. On touch devices we
      // must NOT preventDefault() until we know the gesture is
      // horizontal — otherwise a finger that lands on a card and moves
      // vertically (an ordinary page scroll) gets swallowed instead of
      // scrolling the page.
      const dragStartY = { current: 0 };
      const dragDirectionLocked = { current: null }; // 'horizontal' | 'vertical' | null

      function onPointerDown(e) {
        if (animating.current) return;
        dragStartX.current = e.clientX;
        dragStartY.current = e.clientY;
        dragDirectionLocked.current = null;
        dragging.current = true;
      }

      function onPointerMove(e) {
        if (!dragging.current || animating.current) return;
        const dx = e.clientX - dragStartX.current;
        const dy = e.clientY - dragStartY.current;

        if (dragDirectionLocked.current === null) {
          // Wait for a small, unambiguous movement before deciding —
          // avoids locking in the wrong direction on the very first
          // pixel of jitter.
          if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
          dragDirectionLocked.current =
            Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
        }

        if (dragDirectionLocked.current === "vertical") {
          // Let the browser handle it as a normal page scroll.
          dragging.current = false;
          return;
        }

        // Committed to a horizontal drag — now it's safe to suppress
        // the default touch behavior so the page doesn't also scroll.
        e.preventDefault();

        const centerCard = cardRefs.current.find(
          (_, i) => posSlot(i, offsetRef.current) === 2,
        );
        if (centerCard) {
          gsap.set(centerCard, {
            x: positionsRef.current[2].x + dx * 0.55,
            rotation: dx * 0.04,
          });
        }
      }

      function onPointerUp(e) {
        if (!dragging.current) return;
        dragging.current = false;
        if (dragDirectionLocked.current !== "horizontal") return;
        const dx = e.clientX - dragStartX.current;

        // Mobile swipes are naturally shorter than desktop mouse drags,
        // so a lower distance threshold there keeps a normal swipe from
        // needing to feel like an exaggerated drag to register.
        const shiftThreshold = window.innerWidth <= 700 ? 35 : 80;

        if (Math.abs(dx) > shiftThreshold) {
          shift(dx < 0 ? 1 : -1);
        } else {
          snapCenterBack();
        }
      }

      function onKeyDown(e) {
        if (e.key === "ArrowLeft") shift(1);
        if (e.key === "ArrowRight") shift(-1);
      }

      // Recompute geometry on resize (crossing the 1620px/640px
      // breakpoints) and re-snap every card to its current slot at the
      // new scale — without animating, so a resize doesn't look like a
      // shift. Debounced: window "resize" fires continuously while a
      // window is actively being dragged, and this recomputes positions
      // and re-applies gsap.set to every card on each firing — real,
      // avoidable work happening dozens of times a second otherwise.
      let resizeTimeout;
      function onResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          positionsRef.current = getPositions(window.innerWidth);
          cardRefs.current.forEach((el, cardIdx) => {
            const slot = posSlot(cardIdx, offsetRef.current);
            const p = positionsRef.current[slot];
            gsap.set(el, {
              x: p.x,
              y: p.y,
              rotation: p.rotate,
              width: p.width,
              height: p.height,
              zIndex: p.zIndex,
              opacity: p.opacity,
            });
          });
        }, 150);
      }

      container.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", onResize);

      if (sectionRef.current && !isServicesPage) {
        const section = sectionRef.current;
        const colorTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "center center",
            scrub: 1,
          },
        });
        colorTl.to(document.body, { "--bodybg": "#fff", ease: "none" }, 0);

        // Heading + bottom nav arrows were white-on-black; now the page
        // (and this section's own background) turns white alongside
        // them, so they need to flip to black to stay legible.
        const heading = section.querySelector(".client-review-section-text");
        if (heading) {
          colorTl.to(heading, { color: "#000", ease: "none" }, 0);
        }

        const navBtns = section.querySelectorAll(".client-review-nav-btn");
        if (navBtns.length) {
          colorTl.to(
            navBtns,
            { borderColor: "rgba(0, 0, 0, 0.35)", ease: "none" },
            0,
          );
        }

        // Arrow icons are hardcoded fill="white" in the SVG markup, but
        // GSAP can tween an SVG path's fill attribute directly (unlike
        // a CSS rule, which a presentation attribute would still beat).
        const navBtnSvgPaths = section.querySelectorAll(
          ".client-review-nav-btn svg path",
        );
        if (navBtnSvgPaths.length) {
          colorTl.to(navBtnSvgPaths, { fill: "#000", ease: "none" }, 0);
        }

        // CTA button swaps from its white variant (cta-button-white —
        // white bg, black text/arrow) to the plain black variant (black
        // bg, white text/arrow) it'd normally need against a black
        // page, since the page is now white behind it. Driven by
        // isCtaDark React state (flipped below) rather than a direct
        // GSAP tween on the button node: .client-review-cta remounts a
        // fresh CtaButton every time the active review changes (it's
        // keyed on active.id), which would detach a live tween from its
        // target — state survives that remount since it lives on this
        // component, not the node.
        colorTl.eventCallback("onUpdate", () => {
          setIsCtaDark(colorTl.progress() > 0.5);
        });

        // Added separately (not chained above) and polled for briefly
        // first: GSAP resolves an element/selector target once,
        // synchronously, when it's added to the timeline — .nav-bar/
        // .menu-dropdown live in a sibling component (Navbar.jsx) that
        // isn't guaranteed to have mounted yet at this exact moment.
        let attempts = 0;
        const addNavbarDarkenTween = () => {
          if (cancelled) return;
          const navBar = document.querySelector(".nav-bar");
          const menuDropdown = document.querySelector(".menu-dropdown");
          if (navBar && menuDropdown) {
            colorTl.to(
              [navBar, menuDropdown],
              { backgroundColor: "#0a0a0a", ease: "none" },
              0,
            );
            return;
          }
          attempts += 1;
          if (attempts < 30) requestAnimationFrame(addNavbarDarkenTween);
        };
        addNavbarDarkenTween();
      }

      ScrollTrigger.refresh();

      return () => {
        container.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimeout);
      };
    }, containerRef);

    return () => {
      cancelled = true; // guards the deferred rAF poll above if unmount beats it
      ctx.revert(); // also reverts document.body/.nav-bar/.menu-dropdown's
      // color tweens back to their pre-tween values, same as
      // Testimonials.jsx relies on for its own copy of this tween.
      //
      // Only clear document.body here if this effect actually set it —
      // on /services the colorTl block above was skipped entirely, so
      // the black inline background at this point belongs to Slider.jsx
      // (see services/page.jsx), not this component; clearing it here
      // would strip that black out from under it. Same guard
      // Testimonials.jsx applies to its own identical cleanup.
      if (!isServicesPage) {
        gsap.set(document.body, { clearProps: "--bodybg" }); // don't leak white bg to other routes
      }
    };
  }, [isServicesPage]);

  useEffect(() => {
    if (tagsIndex === activeIndex) return;
    const tagEls = tagsRef.current?.querySelectorAll(".client-review-tag");
    if (!tagEls || tagEls.length === 0) {
      setTagsIndex(activeIndex);
      return;
    }

    gsap.killTweensOf(tagEls);
    gsap.to(tagEls, {
      scale: 0,
      opacity: 0,
      duration: 0.25,
      stagger: 0.04,
      overwrite: true,
      onComplete: () => setTagsIndex(activeIndex),
    });
  }, [activeIndex, tagsIndex]);

  const isFirstTagsRender = useRef(true);
  useEffect(() => {
    if (isFirstTagsRender.current) {
      // Skip the pop-in on initial mount — the first review's tags
      // should just be there already, not animate in on page load.
      isFirstTagsRender.current = false;
      return;
    }
    const tagEls = tagsRef.current?.querySelectorAll(".client-review-tag");
    if (!tagEls || tagEls.length === 0) return;
    gsap.fromTo(
      tagEls,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        stagger: 0.04,
        ease: "back.out(1.7)",
      },
    );
  }, [tagsIndex]);

  const active = REVIEWS[activeIndex];
  const displayedTagsReview = REVIEWS[tagsIndex];

  return (
    <div className="client-review-section-container" ref={sectionRef}>
      <TextAnimation animateOnScroll={true} delay={0.3}>
        <h1 className="client-review-section-text">
          <span className="client-review-heading-line-1">Real Stories.</span>
          <span className="client-review-heading-line-2">Real Results.</span>
        </h1>
      </TextAnimation>

      <div className="client-review-row">
        <div className="client-review-info">
          <ChangeTextAnimation
            key={`name-${active.id}`}
            animateOnScroll={false}
          >
            <h2 className="client-review-name">{active.name}</h2>
          </ChangeTextAnimation>
          <div
            className="client-review-tags"
            key={`tags-${displayedTagsReview.id}`}
            ref={tagsRef}
          >
            {displayedTagsReview.tags.map((tag) => (
              <span className="client-review-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="client-review-card-container" ref={containerRef}>
          {REVIEWS.map((item, i) => (
            <div
              key={item.id}
              className="client-review-card"
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
            >
              {item.video ? (
                <>
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={item.video}
                    poster={item.poster}
                    // Only the centered card autoplays — the effect above
                    // (keyed on activeIndex) pauses/plays every card
                    // explicitly, but autoPlay here also covers this
                    // exact card's first render as the initial center
                    // (i === activeIndex on mount), before that effect's
                    // first run would otherwise be the only thing to
                    // start it.
                    autoPlay={i === activeIndex}
                    // Never let an off-center card inherit the shared
                    // sound setting. This also mutes the outgoing card
                    // during React's render, before the effect runs.
                    muted={i === activeIndex ? isMuted : true}
                    loop
                    playsInline
                    draggable={false}
                  />
                  {i === activeIndex && (
                    <button
                      type="button"
                      className="client-review-mute-btn"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                      onClick={(e) => {
                        e.stopPropagation();
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
                  )}
                </>
              ) : (
                <Image
                  src={item.image}
                  alt="review"
                  draggable={false}
                  fill
                  sizes="(max-width: 640px) 55vw, (max-width: 1620px) 78vw, 390px"
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
          ))}

          {/* Anchored to the center card slot, not any individual review
              card — swaps diagonal corners each time an arrow is
              clicked, independent of which review is showing. */}
          {/* <Image
            src="/sticker1.avif"
            alt=""
            width={90}
            height={90}
            style={{ width: "90px", height: "auto" }}
            className={`client-review-sticker client-review-sticker-1 ${
              stickerCorner === "tl-br"
                ? "client-review-sticker--top-left"
                : "client-review-sticker--top-right"
            }`}
          />
          <Image
            src="/sticker2.avif"
            alt=""
            width={90}
            height={90}
            style={{ width: "90px", height: "auto" }}
            className={`client-review-sticker client-review-sticker-2 ${
              stickerCorner === "tl-br"
                ? "client-review-sticker--bottom-right"
                : "client-review-sticker--bottom-left"
            }`}
          /> */}
        </div>

        <div className="client-review-cta" key={`cta-${active.id}`}>
          <VyrlCtaButton
            label={active.ctaLabel}
            href={active.href}
            external={active.href !== "#"}
            className={isCtaDark ? "vyrl-cta--solid" :"vyrl-cta--invert"}
          />
          <p>
            Hear from the brands and founders we have partnered with, sharing
            what it is like to build, launch, and grow with Vyrl.
          </p>
        </div>
      </div>

      <div className="client-review-nav">
        <button
          className="client-review-nav-btn"
          onClick={() => shiftRef.current?.(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="22"
            viewBox="0 0 13 22"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.516885 12.222L10.5037 22L13 19.5559L4.26129 11L13 2.44406L10.5037 0L0.516885 9.77797C0.185924 10.1021 0 10.5417 0 11C0 11.4583 0.185924 11.8979 0.516885 12.222Z"
              fill="white"
            />
          </svg>
        </button>
        <button
          className="client-review-nav-btn"
          onClick={() => shiftRef.current?.(1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="22"
            viewBox="0 0 13 22"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.4831 12.222L2.49627 22L0 19.5559L8.73871 11L0 2.44406L2.49627 0L12.4831 9.77797C12.8141 10.1021 13 10.5417 13 11C13 11.4583 12.8141 11.8979 12.4831 12.222Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ClientReviewSection;
