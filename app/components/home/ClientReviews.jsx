"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import TextAnimation from "./TextAnimation";
import ChangeTextAnimation from "../layout/ChangeTextAnimation";
import CtaButton from "../layout/cta";
       
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
    height: 440,
    opacity: 1,
  },
  {
    x: -100,
    y: 20,
    rotate: -9,
    zIndex: 2,
    width: 330,
    height: 490,
    opacity: 1,
  },
  { x: 0, y: 0, rotate: 0, zIndex: 5, width: 390, height: 540, opacity: 1 },
  { x: 100, y: 20, rotate: 9, zIndex: 2, width: 330, height: 490, opacity: 1 },
  { x: 200, y: 40, rotate: 14, zIndex: 1, width: 280, height: 440, opacity: 1 },
];

function getResponsiveScale(viewportWidth) {
  if (viewportWidth <= 640) return 0.55;
  if (viewportWidth <= 1620) return 0.78;
  return 1;
}

// Side cards' x offset needs to shrink faster than their size on small
// screens, or they push past the viewport edge — at 0.55x size-scale,
// a 200px base offset still lands ~110px from center, which overflows
// a narrow phone. Pull them in further on top of the size scale.
function getOffsetScale(viewportWidth) {
  if (viewportWidth <= 640) return 0.45;
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
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=face",
    name: "Sanam Cars",
    tags: ["SPLINE", "THREE.JS", "3D"],
    ctaLabel: "View Site",
    href: "#",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
    name: "Nova Fitness",
    tags: ["BRANDING", "WEB"],
    ctaLabel: "View Site",
    href: "#",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=face",
    name: "Lumen Studio",
    tags: ["MOTION", "GSAP", "3D"],
    ctaLabel: "View Site",
    href: "#",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face",
    name: "Orbit Foods",
    tags: ["UI/UX", "NEXT.JS"],
    ctaLabel: "View Site",
    href: "#",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
    name: "Halcyon Wear",
    tags: ["ECOMMERCE", "BRANDING", "3D"],
    ctaLabel: "View Site",
    href: "#",
  },
];

const N = 5;
 
function ClientReviewSection() {
  const cardRefs = useRef([]);
  const offsetRef = useRef(0);
  const animating = useRef(false);
  const dragStartX = useRef(0);
  const dragging = useRef(false);
  const containerRef = useRef(null);
  const shiftRef = useRef(null);
  const positionsRef = useRef(
    getPositions(typeof window !== "undefined" ? window.innerWidth : 1920),
  );
  const [activeIndex, setActiveIndex] = useState(2);

  function posSlot(cardIdx, offset) {
    return (((cardIdx - offset) % N) + N) % N;
  }

  useEffect(() => {
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
      // shift.
      function onResize() {
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
      }

      container.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("resize", onResize);

      return () => {
        container.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const active = REVIEWS[activeIndex];

  return (
    <div className="client-review-section-container">
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
          <div className="client-review-tags" key={`tags-${active.id}`}>
            {active.tags.map((tag) => (
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
                <video
                  src={item.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  draggable={false}
                />
              ) : (
                <img src={item.img} alt="review" draggable={false} />
              )}
            </div>
          ))}
        </div>

        <div className="client-review-cta" key={`cta-${active.id}`}>
          <CtaButton
            label={active.ctaLabel}
            href={active.href}
            className="cta-button-white client-review-cta-btn"
          />
        </div>
      </div>

      <div className="client-review-nav">
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
              d="M0.516885 12.222L10.5037 22L13 19.5559L4.26129 11L13 2.44406L10.5037 0L0.516885 9.77797C0.185924 10.1021 0 10.5417 0 11C0 11.4583 0.185924 11.8979 0.516885 12.222Z"
              fill="white"
            />
          </svg>
        </button>
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
