"use client";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import "../../styles/caseStudyInner.css";
import { getCaseStudy, getNextCaseStudy } from "./caseStudiesData";
import CtaButton from "../layout/cta";

gsap.registerPlugin(ScrollTrigger, Flip);

const CaseStudyInner = ({ slug }) => {
  const c1 = getCaseStudy(slug);
  const nextCase = getNextCaseStudy(slug);
  const c2 = {
    ...nextCase,
    image: nextCase?.panel8Image ?? nextCase?.images?.[0],
    nextLabel: "Next Page",
  };
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
  const mockupRef = useRef(null);
  const isFlipped = useRef(false);
  const transitionTriggered = useRef(false);
  const ctxRef = useRef(null);
  // Set synchronously the instant this component starts unmounting (see
  // the effect cleanup below) — GSAP's ticker/Lenis's raf loop can still
  // fire ScrollTrigger's onUpdate/onLeave one more time after a route
  // change is already underway but before React has actually torn this
  // component's ScrollTrigger down, since ctx.revert() and the
  // navigation are two independent async processes. Without this guard,
  // that one extra onUpdate tick could see barProgress >= 1 (very likely
  // once the user has scrolled through most of the page already) and
  // fire runTransition's own router.push(nextHref) — which is what made
  // navigating away via the navbar/logo briefly show the target page,
  // then snap to the next case study in sequence instead.
  const isUnmountingRef = useRef(false);

  const router = useRouter();

  // ── reveal: fade out the transition overlay that SPA-nav carries into this page
  // useLayoutEffect (not useEffect) so this runs BEFORE the browser paints
  // this page's first frame, not after. With useEffect there was a real
  // gap between "new page mounts and paints" and "this effect actually
  // runs" — the browser could show one frame of the new page's default
  // scroll position / pre-fade overlay state before this code got a
  // chance to reset scroll and start the fade, which is what read as a
  // jitter (old content, then a flash of the next page's raw state,
  // before it visually settled).
  useLayoutEffect(() => {
    // Next.js's client-side router keeps whatever scroll position the
    // previous page (e.g. /projects, scrolled down to reach a later
    // card) was at — it doesn't reset to the top on navigation the way
    // a hard page load does. Landing here mid-scroll fed a non-zero
    // starting position into this page's pinned ScrollTrigger below,
    // which computes its progress off actual scroll position — so the
    // pin effectively started partway through instead of at panel 1.
    // Resetting both native scroll and Lenis's own tracked position
    // (Lenis persists as a single global instance across routes, see
    // SmoothScroll.jsx) guarantees every case-study page always opens
    // at the very top regardless of where the previous page left off.
    window.scrollTo(0, 0);
    window.lenis?.scrollTo(0, { immediate: true });

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

    // Panel 1's mockup is visible immediately on mount (this is the first
    // panel of a horizontally-scrolling section, not something that
    // scrolls into view vertically), so it gets a plain time-based
    // fade-in here rather than a scroll-triggered one — matching the
    // "focus pull" look ParalImage's fade uses for scroll-revealed images.
    if (mockupRef.current) {
      gsap.fromTo(
        mockupRef.current,
        { autoAlpha: 0, y: 40, scale: 0.96, filter: "blur(8px)" },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "power4.out",
          delay: 0.15,
        },
      );
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

    // router.push() must fire *before* any of this page's own DOM/scroll
    // state is touched. Previously this reverted the pinned ScrollTrigger
    // (collapsing its pin-spacer) and reset scroll to 0 first, then
    // pushed — but that revert+reset happens on this still-visible page,
    // so the browser paints that jump-to-top snap on lala-darbar itself
    // for a frame before the route swap ever starts, reading as "goes to
    // top, then changes route" instead of a clean cut to the next page.
    // Pushing first lets the route change begin immediately; the pinned
    // ScrollTrigger and pin-spacer get torn down for free moments later
    // as a side effect of this component's own unmount cleanup (below),
    // by which point the incoming page is what's actually driving what's
    // on screen — so the collapse/scroll-reset never has a visible frame
    // to show through on the outgoing page.
    const goToNext = () => router.push(nextHref);

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

    // Extra scroll distance (px) reserved purely for filling the loader
    // bar after the horizontal scroll finishes — larger means more scroll
    // is needed to fill it, i.e. "more scrollable."
    const extraForBar = 900;
    if (fill) fill.style.width = "0%";

    // Below this width the CSS (see caseStudyInner.css) switches .cs-inner
    // to a normal vertical stack instead of a horizontal-scroll strip, so
    // the pin + horizontal-translate + containerAnimation math below
    // (which assumes a fixed-width row of panels) no longer applies.
    const isMobile = window.innerWidth <= 900;

    // gsap.context() tracks every tween / ScrollTrigger created inside.
    // ctx.revert() tears them all down including the pin-spacer div that
    // GSAP wraps around the pinned element — which is what caused the
    // removeChild error when React tried to unmount a node that was no
    // longer in its expected parent.
    const ctx = gsap.context(() => {
      const maxHorizDist = isMobile ? 0 : inner.scrollWidth - window.innerWidth;
      const phase2Dur = maxHorizDist > 0 ? extraForBar / maxHorizDist : 0.1;

      // Mobile equivalent of runTransition below, minus the heading-fly
      // animation. That fly effect computes its target position from
      // getBoundingClientRect() math written for the desktop horizontal-
      // scroll layout (panels side by side, pinned section) — on mobile,
      // panels stack vertically in normal document flow, so those same
      // coordinates land in the wrong place. That mismatch is what
      // produced the "shows current project, then next project's heading
      // flies to the wrong spot, then jumps to top" glitch on mobile.
      // A plain fade-to-white-then-navigate sidesteps the mismatched math
      // entirely instead of trying to recompute it for a different layout.
      const runMobileTransition = () => {
        // isUnmountingRef only flips once React has actually torn this
        // component down, which happens on the *next* render commit —
        // with next-view-transitions, that commit is deferred behind
        // document.startViewTransition() taking its DOM snapshot first,
        // so there's a real window (worse on a slow route/data fetch)
        // where this delayed call can still fire after the user already
        // clicked away to a different route. Comparing against the
        // live URL closes that gap regardless of how long the other
        // navigation's commit takes — if we're not even on this case
        // study's own path anymore, some other navigation already won
        // and this one must not stomp it with its own router.push.
        if (isUnmountingRef.current || window.location.pathname !== c1.href)
          return;

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

        gsap.to(overlay, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.in",
          onComplete: goToNext,
        });
      };

      const runTransition = () => {
        // See the matching comment in runMobileTransition above — same
        // race, same fix.
        if (isUnmountingRef.current || window.location.pathname !== c1.href)
          return;
        const headingEl = panel8?.querySelector(".cs-p8-project-name");

        if (!headingEl) {
          goToNext();
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
          // "normal" (not a resolved px value, and not hardcoded to
          // 1) so the line-box keeps scaling proportionally with
          // fontSize as it animates up in Phase 1 below, matching
          // how .cs-title (the real handoff target — also
          // line-height: normal) renders at any size. A fixed px
          // value here would freeze the ratio at the clone's
          // starting font-size, drifting out of sync with the real
          // heading's line-box as the clone grows — which is what
          // produced the "lands, then visibly settles" gap once the
          // real .cs-title took over from the clone.
          lineHeight: "1",
          whiteSpace: "nowrap",
        });
        document.body.appendChild(clone);

        // Hide the real panel-8 heading the instant its clone takes over —
        // otherwise it stays visible in place while the clone flies off,
        // showing both at once (the clone moving left, the original
        // still sitting where it started).
        headingEl.style.visibility = "hidden";

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
        //
        // OVERSHOOT_CORRECTION_PX nudges the landing spot down slightly:
        // the clone reads this page's own panel-1 heading as a stand-in
        // for where the next page's heading will sit, and in practice
        // it lands a touch higher than the real thing once the new
        // page mounts. Increase this value to land lower/closer.
        const OVERSHOOT_CORRECTION_PX = 0;
        const panel1Title = inner.querySelector(".cs-title");
        const targetTop =
          (panel1Title ? panel1Title.getBoundingClientRect().top : 100) +
          OVERSHOOT_CORRECTION_PX;
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
          onComplete: goToNext,
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
        gsap.to(clone, {
          color: "#0a0a0a",
          duration: 0.45,
          ease: "power2.in",
        });

        // Overlay fades in as heading arrives (covers panel-8 background
        // vanishing, and must be fully opaque *before* the page swap so
        // the old clone and the new page's real heading are never both
        // visible at once). flyTl (phase1 0.85s + phase2 0.45s) completes
        // at 1.3s and triggers router.push right after — this needs to
        // finish comfortably earlier than that, not just barely before it.
        gsap.to(overlay, {
          opacity: 1,
          duration: 0.3,
          delay: 0.75,
          ease: "power2.in",
        });
      };

      if (isMobile) {
        // ── Mobile: normal vertical scroll, no pin/horizontal-hijack ──
        // Panels are stacked in document flow (see the CSS breakpoint),
        // so each animated bit is triggered independently off its own
        // position in the page instead of off one shared horizontal
        // timeline.
        textPanels.forEach(({ els }) => {
          if (!els.length) return;
          gsap.fromTo(
            els,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: els[0],
                start: "top 88%",
              },
            },
          );
        });

        [".cs-panel--2", ".cs-panel--4", ".cs-panel--5", ".cs-panel--6"]
          .map((sel) => inner.querySelector(sel))
          .filter(Boolean)
          .forEach((panel) => {
            const img = panel.querySelector("img");
            if (!img) return;

            gsap.fromTo(
              img,
              { autoAlpha: 0, scale: 1.08 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 85%",
                },
              },
            );
          });

        const panel8Spacer = inner.querySelector(".cs-panel--8-spacer");

        if (panel8 && panel8Spacer) {
          // Bar width is scrubbed against a dedicated spacer reserved
          // right after panel 8 (see .cs-panel--8-spacer in the CSS),
          // not against panel 8's own height or whatever's left of the
          // page below it — both of those were tried and both broke:
          // panel 8's own height gave too little scroll room (bar filled
          // in ~one gesture), and borrowing space from the Footer meant
          // the fill speed depended on Footer height and could clamp
          // before ever reaching 100% on short footers. A spacer with a
          // known, fixed height gives an exact, guaranteed-reachable
          // scroll distance: 0% right as panel 8 finishes arriving
          // (start), 100% only once the user has scrolled all the way
          // through the spacer (end) — i.e. scroll position stays
          // "parked" on panel 8 while filling, not racing ahead of it.
          if (fill) fill.style.width = "0%";
          ScrollTrigger.create({
            trigger: panel8,
            start: "bottom bottom",
            endTrigger: panel8Spacer,
            end: "bottom bottom",
            // Without pinning, panel 8 just scrolls up and out of view
            // like any normal element while the user scrolls through
            // the spacer below it — the loading bar was filling
            // correctly, but panel 8 itself visibly slid away instead
            // of staying put while it filled. Pinning holds panel 8 in
            // place for this trigger's whole range (i.e. exactly as
            // long as the spacer takes to scroll through), then
            // releases it right as the bar hits 100% and the page
            // transitions away.
            //
            // pinSpacing: false — panel8Spacer (a real DOM sibling,
            // see .cs-panel--8-spacer in the CSS) already supplies the
            // scroll room this trigger needs. GSAP's default pinSpacing
            // would additionally insert its *own* spacer around panel 8
            // sized to the same distance, double-reserving the height
            // and leaving a large empty gap after unpin once that
            // spacer collapsed back down. With it off, nothing gets
            // double-booked — panel 8 unpins right where panel8Spacer
            // ends, no leftover gap before the Footer.
            pin: true,
            pinSpacing: false,
            scrub: 0.3,
            onUpdate: (self) => {
              if (isUnmountingRef.current) return;
              if (fill) fill.style.width = `${self.progress * 100}%`;
            },
            onLeave: () => {
              if (isUnmountingRef.current) return;
              if (transitionTriggered.current) return;
              transitionTriggered.current = true;
              if (fill) fill.style.width = "100%";
              // Doubled vs. desktop's 0.5s: the bar filling and the
              // transition kicking off read as almost simultaneous on
              // mobile before, not leaving enough time to actually
              // register the completed bar before the page changed.
              gsap.delayedCall(2 , runMobileTransition);
            },
          });
        }

        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${inner.scrollWidth - window.innerWidth + extraForBar}`,
          pin: true,
          // Lenis (global, see SmoothScroll.jsx) already smooths raw wheel
          // input before ScrollTrigger ever sees it — stacking a full
          // 1s scrub lag on top of that double-smooths the motion here,
          // which is what read as sluggish/not-tight image reveals.
          // 0.35 keeps it smooth without the extra lag.
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (isUnmountingRef.current) return;
            const curMaxHorizDist = inner.scrollWidth - window.innerWidth;
            const totalDist = curMaxHorizDist + extraForBar;
            const rawScrollPx = self.progress * totalDist;
            const scrollX = Math.min(rawScrollPx, curMaxHorizDist);

            // A small threshold (rather than > 0) — ScrollTrigger fires
            // onUpdate once immediately on creation with whatever progress
            // it computes at that instant, so `> 0` could flip the button
            // out to its fixed portal position before the user has
            // actually scrolled at all, reading as an instant jump on
            // page load instead of a response to scrolling.
            if (rawScrollPx > 4) flipToPortal();

            const fadeThreshold = window.innerWidth * 0.25;
            textPanels.forEach(({ panel, els }) => {
              const panelLeft = panel.offsetLeft - scrollX;
              const opacity =
                panelLeft >= 0 ? 1 : Math.max(0, 1 + panelLeft / fadeThreshold);
              els.forEach((el) => (el.style.opacity = opacity));
            });

            const barProgress = Math.max(
              0,
              Math.min(1, (rawScrollPx - curMaxHorizDist) / extraForBar),
            );

            if (barProgress >= 1 && !transitionTriggered.current) {
              transitionTriggered.current = true;

              // Brief pause once the bar visibly reaches 100% before
              // kicking off the heading-fly + page transition, so the
              // completed bar actually registers instead of the
              // transition starting the instant it fills.
              gsap.delayedCall(0.5, runTransition);
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

          // Horizontal parallax drift as the panel crosses the viewport —
          // this section scrolls horizontally, so a vertical (y) parallax
          // reads as motion on the wrong axis. Runs on the wider,
          // overflow-masked .cs-img-parallax wrapper (see
          // .cs-img-parallax-wrap in the CSS) so the extra width needed
          // for horizontal travel never shows past the panel's fixed
          // visible size. This replaces the old fixed x:70→-70 drift
          // (same axis, same trigger window — just now sized from the
          // wrapper's --paral-offset instead of a hardcoded 70/-70).
          const wrap = panel.querySelector(".cs-img-parallax-wrap");
          const offset = wrap ? 90 : 70;
          if (wrap) wrap.style.setProperty("--paral-offset", `${offset}px`);
          gsap.fromTo(
            img,
            { x: offset / 2 },
            {
              x: -offset / 2,
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
      isUnmountingRef.current = true;

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
                <CtaButton
                  ref={btnRef}
                  label="View website"
                  href={c1.websiteUrl}
                  external
                  // className="cs-visit-btn"
                />
              </div>
            </div>
            <div className="cs-services-col">
              {c1.duration && (
                <div className="cs-duration">
                  <span className="cs-duration-label">Duration:</span>
                  <span className="cs-duration-value">{c1.duration}</span>
                </div>
              )}
              <ul className="cs-services">
                {c1.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="cs-mockup" ref={mockupRef}>
              <Image src={c1.images[0]} alt={`${c1.title} mockup`} fill className="object-cover" sizes="64vw" />
            </div>
          </div>

          {/* Panel 2 — full-bleed */}
          <div className="cs-panel cs-panel--2">
            <div className="cs-full-img cs-img-parallax-wrap">
              <Image
                className="cs-img-parallax"
                src={c1.images[1]}
                alt=""
                width={1920}
                height={1080}
                sizes="90vw"
              />
            </div>
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
            <div className="cs-img-80 cs-img-parallax-wrap">
              <Image
                className="cs-img-parallax"
                src={c1.images[2]}
                alt=""
                width={1600}
                height={1200}
                sizes="65vw"
              />
            </div>
          </div>

          {/* Panel 5 */}
          <div className="cs-panel cs-panel--5">
            <div className="cs-img-90 cs-img-parallax-wrap">
              <Image
                className="cs-img-parallax"
                src={c1.images[3]}
                alt=""
                width={1600}
                height={1900}
                sizes="60vw"
              />
            </div>
          </div>

          {/* Panel 6 */}
          <div className="cs-panel cs-panel--6">
            <div className="cs-img-80 cs-img-parallax-wrap">
              <Image
                className="cs-img-parallax"
                src={c1.images[4]}
                alt=""
                width={1600}
                height={1200}
                sizes="65vw"
              />
            </div>
          </div>

          {/* Panel 7 — credits */}
          <div className="cs-panel cs-panel--7">
            <h4 className="cs-similar-title">{c1.creditsTitle}</h4>
            <p className="cs-similar-sub">{c1.creditsText}</p>
          </div>

          {/* Panel 8 — next project */}
          <div className="cs-panel cs-panel--8">
            <Image
              className="cs-full-img"
              src={c2.image}
              alt={c2.title}
              width={1920}
              height={1080}
              sizes="55vw"
            />
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

          {/* Mobile-only spacer reserved purely for the panel-8 loading
              bar to scrub against (see the ScrollTrigger in the effect
              above) — gives it real, dedicated scroll room independent
              of the Footer's height instead of borrowing whatever's left
              after panel 8, which is what made the bar's fill speed vs.
              "how far the page has actually scrolled" depend on Footer
              height. Hidden on desktop (.cs-panel--8-spacer in the CSS)
              where the pinned horizontal timeline's own extraForBar
              already does this job. */}
          <div className="cs-panel--8-spacer" />
        </div>
      </div>
    </>
  );
};

export default CaseStudyInner;
