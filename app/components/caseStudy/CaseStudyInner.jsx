"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { getCaseStudy, getNextCaseStudy } from "./caseStudiesData";

gsap.registerPlugin(ScrollTrigger, Flip);

// ─── component ────────────────────────────────────────────────────────────────

const CaseStudyInner = ({ slug }) => {
  const c1 = getCaseStudy(slug);
  const nextCase = getNextCaseStudy(slug);
  const c2 = { ...nextCase, image: nextCase?.images?.[0], nextLabel: "Next Page" };
  const nextHref = nextCase?.href ?? "/";

  if (!c1) {
    throw new Error(`CaseStudyInner: no case study found for slug "${slug}"`);
  }

  const sectionRef = useRef(null);
  const innerRef = useRef(null);
  const btnRef = useRef(null);
  const btnSlotRef = useRef(null);
  const portalRef = useRef(null);
  const progressFillRef = useRef(null);
  const isFlipped = useRef(false);
  const transitionTriggered = useRef(false);
  const ctxRef = useRef(null);

  const router = useRouter();


  // ── reveal: fade out the transition overlay that SPA-nav carries into this page
  useEffect(() => {
    const overlay = document.querySelector(".cs-transition-overlay");
    const clone = document.querySelector(".cs-heading-clone");
    clone?.remove(); // real heading is already here at matching position
    if (overlay) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => overlay.remove(),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── main horizontal-scroll + bar-fill setup
  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    const btn = btnRef.current;
    const portal = portalRef.current;
    const fill = progressFillRef.current;

    // ── helpers (defined outside ctx so they close over captured DOM refs) ──
    const flipToPortal = () => {
      if (isFlipped.current) return;
      isFlipped.current = true;
      const state = Flip.getState(btn);
      portal.appendChild(btn);
      Flip.from(state, { duration: 0.75, ease: "power3.inOut", scale: true });
    };

    const flipToHeader = () => {
      if (!isFlipped.current) return;
      isFlipped.current = false;
      const state = Flip.getState(btn);
      btnSlotRef.current.appendChild(btn);
      Flip.from(state, { duration: 0.75, ease: "power3.inOut", scale: true });
    };

    const textPanels = [
      { sel: ".cs-panel--1", items: [".cs-title", ".cs-services li"] },
      { sel: ".cs-panel--3", items: [".cs-p3-content h3", ".cs-p3-content p"] },
      { sel: ".cs-panel--7", items: [".cs-similar-title", ".cs-similar-sub"] },
    ]
      .map(({ sel, items }) => {
        const panel = inner.querySelector(sel);
        if (!panel) return null;
        const els = items.flatMap((s) => Array.from(panel.querySelectorAll(s)));
        return { panel, els };
      })
      .filter(Boolean);

    const panel8 = inner.querySelector(".cs-panel--8");
    const p8TextEls = panel8
      ? Array.from(
          panel8.querySelectorAll(
            ".cs-p8-services, .cs-p8-project-name, .cs-p8-next-text",
          ),
        )
      : [];
    p8TextEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateX(120px)";
    });

    const extraForBar = 600;
    if (fill) fill.style.width = "0%";

    // gsap.context() tracks every tween / ScrollTrigger created inside.
    // ctx.revert() tears them all down including the pin-spacer div that
    // GSAP wraps around the pinned element — which is what caused the
    // removeChild error when React tried to unmount a node that was no
    // longer in its expected parent.
    const ctx = gsap.context(() => {
      const maxHorizDist = inner.scrollWidth - window.innerWidth;
      const phase2Dur = maxHorizDist > 0 ? extraForBar / maxHorizDist : 0.1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${inner.scrollWidth - window.innerWidth + extraForBar}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const curMaxHorizDist = inner.scrollWidth - window.innerWidth;
            const totalDist = curMaxHorizDist + extraForBar;
            const rawScrollPx = self.progress * totalDist;
            const scrollX = Math.min(rawScrollPx, curMaxHorizDist);

            if (rawScrollPx > 0) flipToPortal();

            const fadeThreshold = window.innerWidth * 0.25;
            textPanels.forEach(({ panel, els }) => {
              const panelLeft = panel.offsetLeft - scrollX;
              const opacity =
                panelLeft >= 0
                  ? 1
                  : Math.max(0, 1 + panelLeft / fadeThreshold);
              els.forEach((el) => (el.style.opacity = opacity));
            });

            const barProgress = Math.max(
              0,
              Math.min(1, (rawScrollPx - curMaxHorizDist) / extraForBar),
            );
            const textFrac = Math.max(
              0,
              Math.min(1, (barProgress - 0.5) / 0.5),
            );
            p8TextEls.forEach((el) => {
              el.style.transform = `translateX(${120 * (1 - textFrac)}px)`;
              el.style.opacity = String(textFrac);
            });

            if (barProgress >= 1 && !transitionTriggered.current) {
              transitionTriggered.current = true;

              const headingEl = panel8?.querySelector(".cs-p8-project-name");

              if (!headingEl) {
                ctxRef.current?.revert();
                router.push(nextHref);
                return;
              }

              const rect = headingEl.getBoundingClientRect();
              const cs = window.getComputedStyle(headingEl);

              // Fixed clone — detached from scroll container, flies freely above page
              const clone = document.createElement("div");
              clone.className = "cs-heading-clone";
              clone.textContent = headingEl.textContent;
              Object.assign(clone.style, {
                position: "fixed",
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                margin: "0",
                padding: "0",
                zIndex: "99999",
                pointerEvents: "none",
                fontSize: cs.fontSize,
                fontWeight: cs.fontWeight,
                color: cs.color,
                fontFamily: cs.fontFamily,
                lineHeight: "1",
                whiteSpace: "nowrap",
              });
              document.body.appendChild(clone);

              // White overlay — stays alive through SPA navigation
              const overlay = document.createElement("div");
              overlay.className = "cs-transition-overlay";
              Object.assign(overlay.style, {
                position: "fixed",
                inset: "0",
                background: "#fff",
                zIndex: "99998",
                opacity: "0",
                pointerEvents: "none",
              });
              document.body.appendChild(overlay);

              // Exact target: query panel-1 title directly.
              // getBoundingClientRect().top is correct even when panel-1 is off-screen
              // to the left — horizontal transforms don't affect the vertical coordinate.
              const panel1Title = inner.querySelector(".cs-title");
              const targetTop = panel1Title
                ? panel1Title.getBoundingClientRect().top
                : 100;
              const targetLeft = 50; // matches .cs-p1-header padding-left

              const rootFontSize = parseFloat(
                getComputedStyle(document.documentElement).fontSize,
              );
              const targetFontSize = Math.min(
                75,
                Math.max(rootFontSize * 3, window.innerWidth * 0.055),
              );

              // ── Two-phase path: glide left, then settle vertically
              const flyTl = gsap.timeline({
                onComplete: () => {
                  ctxRef.current?.revert();
                  router.push(nextHref);
                },
              });

              // Phase 1 — long horizontal glide to panel-1 left edge
              flyTl.to(clone, {
                left: targetLeft,
                fontSize: targetFontSize,
                duration: 0.85,
                ease: "expo.inOut",
              });

              // Phase 2 — soft vertical settle to exact heading position
              flyTl.to(clone, {
                top: targetTop,
                duration: 0.45,
                ease: "power3.out",
              });

              // Color shifts to dark early — readable before crossing white background
              gsap.to(clone, { color: "#0a0a0a", duration: 0.45, ease: "power2.in" });

              // Overlay fades in as heading arrives (covers panel-8 background vanishing)
              gsap.to(overlay, {
                opacity: 1,
                duration: 0.4,
                delay: 0.85,
                ease: "power2.in",
              });
            }
          },
          onLeaveBack: flipToHeader,
        },
      });

      tl.to(inner, {
        x: () => -(inner.scrollWidth - window.innerWidth),
        ease: "none",
        duration: 1,
      });

      tl.to(fill, { width: "100%", ease: "none", duration: phase2Dur });

      [".cs-panel--2", ".cs-panel--4", ".cs-panel--5", ".cs-panel--6"]
        .map((sel) => inner.querySelector(sel))
        .filter(Boolean)
        .forEach((panel) => {
          const img = panel.querySelector("img");
          if (!img) return;

          gsap.set(img, {
            clipPath: "polygon(0% 45%, 100% 45%, 100% 55%, 0% 55%)",
          });

          gsap.fromTo(
            img,
            { clipPath: "polygon(0% 45%, 100% 45%, 100% 55%, 0% 55%)" },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              ease: "power3.out",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tl,
                start: "left right",
                end: "center right",
                scrub: true,
              },
            },
          );

          gsap.fromTo(
            img,
            { x: 70 },
            {
              x: -70,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tl,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
    });

    ctxRef.current = ctx;

    return () => {
      // Restore btn to its original React-rendered parent BEFORE ctx.revert()
      // so React can cleanly removeChild it from the right node.
      if (btn && btnSlotRef.current && btn.parentNode !== btnSlotRef.current) {
        gsap.killTweensOf(btn);
        btnSlotRef.current.appendChild(btn);
      }
      // ctx.revert() kills every tween/ScrollTrigger created in the context
      // and removes the pin-spacer wrapper that GSAP inserted around .cs-outer.
      ctx.revert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="cs-btn-portal" ref={portalRef} />

      <div className="cs-outer" ref={sectionRef}>
        <div className="cs-inner" ref={innerRef}>
          {/* Panel 1 — current case study header */}
          <div className="cs-panel cs-panel--1">
            <div className="cs-p1-header">
              <h2 className="cs-title">{c1.title}</h2>
              <div className="cs-btn-slot" ref={btnSlotRef}>
                <button className="cs-visit-btn" ref={btnRef}>
                  View website
                  <span className="cs-btn-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="19"
                      viewBox="0 0 15 18"
                      fill="none"
                    >
                      <path
                        d="M10.3215 -4.76837e-07L0.000134825 4.48818L0.648172 5.93679L8.4792 2.53763L2.70522 17.4251L4.19695 18.0036L9.97093 3.11619L13.4622 10.9066L14.9175 10.2738L10.3215 -4.76837e-07Z"
                        fill="#E6E6E6"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
            <ul className="cs-services">
              {c1.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="cs-mockup">
              <img src={c1.images[0]} alt={`${c1.title} mockup`} />
            </div>
          </div>

          {/* Panel 2 — full-bleed */}
          <div className="cs-panel cs-panel--2">
            <img className="cs-full-img" src={c1.images[1]} alt="" />
          </div>

          {/* Panel 3 — description */}
          <div className="cs-panel cs-panel--3">
            <div className="cs-p3-content">
              <h3>{c1.infoHeading}</h3>
              <p>{c1.description}</p>
            </div>
          </div>

          {/* Panel 4 */}
          <div className="cs-panel cs-panel--4">
            <img className="cs-img-80" src={c1.images[1]} alt="" />
          </div>

          {/* Panel 5 */}
          <div className="cs-panel cs-panel--5">
            <img className="cs-img-90" src={c1.images[2]} alt="" />
          </div>

          {/* Panel 6 */}
          <div className="cs-panel cs-panel--6">
            <img className="cs-img-80" src={c1.images[3]} alt="" />
          </div>

          {/* Panel 7 — credits */}
          <div className="cs-panel cs-panel--7">
            <h4 className="cs-similar-title">{c1.creditsTitle}</h4>
            <p className="cs-similar-sub">{c1.creditsText}</p>
          </div>

          {/* Panel 8 — next project */}
          <div className="cs-panel cs-panel--8">
            <img className="cs-full-img" src={c2.image} alt={c2.title} />
            <ul className="cs-p8-services">
              {c2.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="cs-p8-bottom">
              <p className="cs-p8-project-name">{c2.title}</p>
              <h3 className="cs-p8-next-text">{c2.nextLabel}</h3>
              <div className="cs-p8-progress">
                <div className="cs-p8-line">
                  <div className="cs-p8-fill" ref={progressFillRef} />
                </div>
                <span className="cs-p8-arrow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="19"
                    viewBox="0 0 22 19"
                    fill="none"
                  >
                    <path
                      d="M0 9.54443C0 10.0168 0.187948 10.4699 0.522495 10.804C0.857044 11.138 1.31079 11.3257 1.78391 11.3257L15.9125 11.3257L11.2267 16.0044C10.9116 16.3421 10.7401 16.7887 10.7482 17.2502C10.7564 17.7116 10.9436 18.1519 11.2705 18.4783C11.5973 18.8046 12.0383 18.9916 12.5004 18.9997C12.9626 19.0079 13.4098 18.8366 13.748 18.5219L21.4783 10.8032C21.8124 10.4692 22 10.0165 22 9.54443C22 9.0724 21.8124 8.61967 21.4783 8.28568L13.748 0.566932C13.5847 0.391926 13.3877 0.251558 13.1689 0.154202C12.9501 0.0568466 12.7139 0.00449708 12.4743 0.000277214C12.2348 -0.00394265 11.9969 0.0400531 11.7748 0.12964C11.5526 0.219228 11.3509 0.352571 11.1815 0.521716C11.0121 0.69086 10.8785 0.892341 10.7888 1.11414C10.6991 1.33593 10.655 1.5735 10.6592 1.81267C10.6635 2.05184 10.7159 2.28771 10.8134 2.50621C10.9109 2.72471 11.0515 2.92136 11.2267 3.08443L15.9125 7.76318L1.78391 7.76318C0.799192 7.76318 0 8.56118 0 9.54443Z"
                      fill="#E6E6E6"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseStudyInner;
