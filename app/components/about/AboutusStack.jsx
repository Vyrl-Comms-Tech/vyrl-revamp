// "use client";

// import { Fragment, useEffect, useRef } from "react";
// import "../../styles/aboutus-stack.css";

// /**
//  * Card data — swap `video` paths for files placed under /public/assets/*
//  * (Next.js serves anything in /public from the site root, e.g. /assets/video-1.mp4)
//  */
// const CARDS = [
//   {
//     id: "keychain",
//     tag: "Creative",
//     title: "first Centered",
//     video: "/smiley_compressed.mp4",
//     description:
//       "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
//   },
//   {
//     id: "video-4",
//     tag: "Creative",
//     title: "second Centered",
//     video: "/video01_compressed.mp4",
//     description:
//       "second  is shaped around your business, audience, goals, and the next stage of your growth.",
//   },
//   {
//     id: "video-3",
//     tag: "Creative",
//     title: "third Centered",
//     video: "/video02_compressed.mp4",
//     description:
//       "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
//   },
//   {
//     id: "video-2",
//     tag: "Creative",
//     title: "fourth Centered",
//     video: "/smiley_compressed.mp4",
//     description:
//       "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
//   }, {
//     id: "video-2",
//     tag: "Creative",
//     title: "Client Centered",
//     video: "/video02_compressed.mp4",
//     description:
//       "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
//   },
// ];

// const COUNTER_LABELS = ["00", "01", "02", "03", "04"];

// export default function AboutUsStack() {
//   const containerRef = useRef(null);
//   const cardRefs = useRef([]);
//   const placeholderRefs = useRef([]);
//   const lineRefs = useRef([]);
//   const counterRefs = useRef([]);

//   const setCardRef = (el) => {
//     if (el && !cardRefs.current.includes(el)) cardRefs.current.push(el);
//   };
//   const setPlaceholderRef = (el) => {
//     if (el && !placeholderRefs.current.includes(el))
//       placeholderRefs.current.push(el);
//   };
//   const setLineRef = (el) => {
//     if (el && !lineRefs.current.includes(el)) lineRefs.current.push(el);
//   };
//   const setCounterRef = (el) => {
//     if (el && !counterRefs.current.includes(el)) counterRefs.current.push(el);
//   };

//   useEffect(() => {
//     let lenis;
//     let gsapCtx;
//     let gsapInstance;
//     let scrollTriggerInstance;
//     let tickerFn;
//     let isMounted = true;

//     (async () => {
//       const [{ default: Lenis }, gsapModule, scrollTriggerModule, flipModule] =
//         await Promise.all([
//           import("lenis"),
//           import("gsap"),
//           import("gsap/ScrollTrigger"),
//           import("gsap/Flip"),
//           import("lenis/dist/lenis.css"),
//         ]);

//       // Guards against React Strict Mode's dev-only double effect invocation:
//       // if this component unmounted while the dynamic imports were in flight,
//       // bail out before creating a second, conflicting Lenis/ScrollTrigger pair.
//       if (!isMounted) return;

//       const gsap = gsapModule.gsap ?? gsapModule.default;
//       const ScrollTrigger =
//         scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default;
//       const Flip = flipModule.Flip ?? flipModule.default;

//       gsap.registerPlugin(ScrollTrigger, Flip);
//       gsapInstance = gsap;
//       scrollTriggerInstance = ScrollTrigger;

//       // Smooth scroll
//       lenis = new Lenis({
//         duration: 0.9,
//         smoothWheel: true,
//         easing: (t) => 1 - Math.pow(1 - t, 3),
//       });

//       // CRITICAL: keep ScrollTrigger's internal scroll position in lockstep
//       // with Lenis. Without this, the pinned/scrubbed timeline below reads a
//       // stale scroll offset and the card enter/exit tweens fire at the wrong
//       // moment — which is what produces the incorrect overlap.
//       lenis.on("scroll", ScrollTrigger.update);

//       // Drive Lenis from GSAP's own ticker instead of a separate rAF loop,
//       // so there is exactly one render loop driving both libraries.
//       tickerFn = (time) => {
//         lenis.raf(time * 1000);
//       };
//       gsap.ticker.add(tickerFn);
//       gsap.ticker.lagSmoothing(0);

//       // Scoped GSAP context so ScrollTrigger instances are cleaned up on unmount
//       gsapCtx = gsap.context(() => {
//         // Explicit stacking order, independent of DOM/source order — later
//         // cards must paint on top of earlier ones for the reveal effect.
//         gsap.set(cardRefs.current, {
//           zIndex: (index) => index + 1,
//         });

//         const containerRect = containerRef.current.getBoundingClientRect();

//         // Snap-and-grow entrance (same mechanic as AboutHero's photo): each
//         // card starts small, matching its placeholder's rect, then Flip
//         // grows/repositions it into its natural full-size stack position.
//         const cardFlips = cardRefs.current.map((card, index) => {
//           const placeholder = placeholderRefs.current[index];
//           if (!card || !placeholder) return null;

//           const naturalRect = card.getBoundingClientRect();
//           const placeholderRect = placeholder.getBoundingClientRect();

//           gsap.set(card, {
//             top: naturalRect.top - containerRect.top,
//             left: naturalRect.left - containerRect.left,
//             width: naturalRect.width,
//             height: naturalRect.height,
//           });
//           const naturalState = Flip.getState(card);

//           gsap.set(card, {
//             top: placeholderRect.top - containerRect.top,
//             left: placeholderRect.left - containerRect.left,
//             width: placeholderRect.width,
//             height: placeholderRect.height,
//           });

//           return Flip.fit(card, naturalState, { getVars: true });
//         });

//         const timeline = gsap.timeline({
//           scrollTrigger: {
//             trigger: containerRef.current,
//             pin: true,
//             scrub: 1,
//             start: "top top",
//             end: "+=400% bottom",
//             invalidateOnRefresh: true,
//           },
//         });

//         cardRefs.current.forEach((card, index) => {
//           const flip = cardFlips[index];
//           if (!card || !flip) return;

//           timeline
//             .to(
//               card,
//               { ...flip, opacity: 1, ease: "none" },
//               index * 0.4,
//             )
//             .to(
//               card,
//               { y: "-=600", scale: 0.1, opacity: 0, ease: "none" },
//               index * 0.4 + 0.9,
//             );
//         });

//         timeline
//           .to(
//             lineRefs.current,
//             { height: "4rem", opacity: 1, stagger: 0.4 },
//             "0.1"
//           )
//           .to(
//             lineRefs.current,
//             { height: "1rem", opacity: 0.4, stagger: 0.4 },
//             "0.6"
//           )
//           .to(counterRefs.current, { color: "#000", stagger: 0.4 }, "0.2");
//       }, containerRef);
//     })();

//     return () => {
//       isMounted = false;

//       if (gsapInstance && tickerFn) {
//         gsapInstance.ticker.remove(tickerFn);
//       }
//       if (lenis) {
//         lenis.destroy();
//       }
//       if (gsapCtx) {
//         // Reverts all animations AND kills the ScrollTriggers created
//         // inside this context.
//         gsapCtx.revert();
//       }
//       // Defensive: in dev/Strict Mode, ensure no orphaned ScrollTrigger
//       // instances survive a fast mount/unmount/mount cycle.
//       if (scrollTriggerInstance) {
//         scrollTriggerInstance
//           .getAll()
//           .filter((st) => st.trigger === containerRef.current)
//           .forEach((st) => st.kill());
//       }
//     };
//   }, []);

//   return (
//     <>
//       <div className="upperSection" />

//       <div className="aboutUsStack" ref={containerRef}>
//         <div className="counterStack">
//           {COUNTER_LABELS.map((label, index) => (
//             <Fragment key={label}>
//               <p ref={setCounterRef}>{label}</p>
//               {index < COUNTER_LABELS.length - 1 && (
//                 <div className="lineFill" ref={setLineRef} />
//               )}
//             </Fragment>
//           ))}
//         </div>

//         {CARDS.map((card, index) => (
//           <div
//             key={`${card.id}-placeholder-${index}`}
//             className="cardsStackPlaceholder"
//             ref={setPlaceholderRef}
//           />
//         ))}

//         {CARDS.map((card, index) => (
//           <div
//             key={`${card.id}-${index}`}
//             ref={setCardRef}
//             className="cardsStack"
//           >
//             <div className="upperHeadingStack">
//               <span>{card.tag}</span>
//               <h1>{card.title}</h1>
//             </div>

//             <video muted loop autoPlay playsInline preload="metadata">
//               <source src={card.video} type="video/mp4" />
//             </video>

//             <p>{card.description}</p>
//           </div>
//         ))}
//       </div>
//     </>
//   );
// }
"use client";

import { Fragment, useEffect, useRef } from "react";
import "../../styles/aboutus-stack.css";

/**
 * Card data — swap `video` paths for files placed under /public/assets/*
 * (Next.js serves anything in /public from the site root, e.g. /assets/video-1.mp4)
 */
const CARDS = [
  {
    id: "keychain",
    tag: "Purpose",
    title: "Impact Comes First",
    video: "/smiley_compressed.mp4",
    description:
      "We care about what the work does, not just how it looks. Every idea, interface, campaign, and system is built with a clear reason behind it — to help your brand earn attention, build trust, and move people toward action",
  },
  {
    id: "video-4",
    tag: "Tailored",
    title: "Built Around The Client",
    video: "/video01_compressed.mp4",
    description:
      "No two brands need the same path. We take time to understand your business, audience, challenges, and goals before shaping the strategy — so the final output feels aligned, useful, and made for your next stage of growth.",
  },
  {
    id: "video-3",
    tag: "Evolution",
    title: "Always Getting Sharper",
    video: "/video02_compressed.mp4",
    description:
      "The digital world changes fast, and we believe our thinking should move faster. We keep refining our process, testing new tools, studying what works, and improving how we create so every client gets the benefit of what we learn next.",
  },
  // {
  //   id: "video-2",
  //   tag: "Creative",
  //   title: "fourth Centered",
  //   video: "/smiley_compressed.mp4",
  //   description:
  //     "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
  // },
  // {
  //   id: "video-5",
  //   tag: "Creative",
  //   title: "Client Centered",
  //   video: "/video02_compressed.mp4",
  //   description:
  //     "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
  // },
];

const COUNTER_LABELS = ["00", "01", "02"];

export default function AboutUsStack() {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const lineRefs = useRef([]);
  const counterRefs = useRef([]);

  cardRefs.current = [];
  lineRefs.current = [];
  counterRefs.current = [];

  const setCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) cardRefs.current.push(el);
  };
  const setLineRef = (el) => {
    if (el && !lineRefs.current.includes(el)) lineRefs.current.push(el);
  };
  const setCounterRef = (el) => {
    if (el && !counterRefs.current.includes(el)) counterRefs.current.push(el);
  };

  useEffect(() => {
    let lenis;
    let gsapCtx;
    let gsapInstance;
    let scrollTriggerInstance;
    let removeStepGestureListeners = null;
    let tickerFn;
    let isMounted = true;

    (async () => {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis/dist/lenis.css"),
        ]);

      // Guards against React Strict Mode's dev-only double effect invocation:
      // if this component unmounted while the dynamic imports were in flight,
      // bail out before creating a second, conflicting Lenis/ScrollTrigger pair.
      if (!isMounted) return;

      const gsap = gsapModule.gsap ?? gsapModule.default;
      const ScrollTrigger =
        scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default;

      gsap.registerPlugin(ScrollTrigger);
      gsapInstance = gsap;
      scrollTriggerInstance = ScrollTrigger;

      // Smooth scroll
      lenis = new Lenis({
        duration: 0.9,
        smoothWheel: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });

      // CRITICAL: keep ScrollTrigger's internal scroll position in lockstep
      // with Lenis. Without this, the pinned/scrubbed timeline below reads a
      // stale scroll offset and the card enter/exit tweens fire at the wrong
      // moment — which is what produces the incorrect overlap.
      lenis.on("scroll", ScrollTrigger.update);

      // Drive Lenis from GSAP's own ticker instead of a separate rAF loop,
      // so there is exactly one render loop driving both libraries.
      tickerFn = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      // Scoped GSAP context so ScrollTrigger instances are cleaned up on unmount
      gsapCtx = gsap.context(() => {
        // Explicit stacking order, independent of DOM/source order — later
        // cards must paint on top of earlier ones for the reveal effect.
        gsap.set(cardRefs.current, {
          zIndex: (index) => index + 1,
        });

        const lastIndex = cardRefs.current.length - 1;

        // Cards before the last one enter then exit (go up) as normal,
        // but the last card enters and STAYS — no exit tweens are added
        // for it, so the timeline's total duration is exactly "everything
        // up through the last card settling in," with no trailing dead
        // time. That's then used as the pin's scroll distance directly,
        // instead of a hardcoded guess, so there's no blank pinned scroll
        // (and no scroll-past-blank-screen) after the last card before
        // the next section appears — on desktop as well as mobile.
        const exitingCards = cardRefs.current.slice(0, lastIndex);

        const timeline = gsap.timeline({ paused: true });

        timeline
          .to(cardRefs.current, { y: 0, scale: 1, stagger: 0.4 })
          .to(
            exitingCards,
            { y: -300, opacity: 0.5, scale: 0.5, stagger: 0.4 },
            "0.5",
          )
          .to(
            exitingCards,
            { y: -600, scale: 0.1, opacity: 0, stagger: 0.4 },
            "1",
          )
          .to(
            lineRefs.current,
            { height: "4rem", opacity: 1, stagger: 0.4 },
            "0.1",
          )
          .to(
            lineRefs.current,
            { height: "1rem", opacity: 0.4, stagger: 0.4 },
            "0.6",
          )
          .to(counterRefs.current, { color: "#000", stagger: 0.4 }, "0.2");

        // Previously held an extra 0.3s once the last card settled (a
        // no-op tween to its own resting scale, purely to reserve dead
        // scroll time before releasing) so the stop read as deliberate
        // rather than a flash. With fewer cards (content went from 5 to
        // 3), that fixed 0.3s became a much larger fraction of the
        // timeline's total duration — which is what showed up as
        // "reaches the last card, then still scrolls with nothing
        // happening" before the pin finally released. Removed so the
        // pin's scroll distance ends right as the last card settles.

        const isMobile = window.innerWidth <= 700;
        const cardCount = cardRefs.current.length;

        // Per-card "settled" timeline positions, used only for the
        // mobile discrete-step mechanic below. Card i's enter tween
        // starts at i*0.4 and (default .to() duration is 0.5s) finishes
        // around i*0.4 + 0.5 — evenly dividing the timeline's *total*
        // duration into cardCount-1 steps assumed the choreography was
        // evenly spaced across its full length, but exits start firing
        // at fixed absolute times (0.5, 1, ...) that don't scale with
        // card count, so that even split landed on arbitrary moments —
        // sometimes mid-exit for a card instead of its settled frame,
        // which is what made a card appear skipped. Anchoring each step
        // to the actual enter-complete instant fixes that.
        const cardSettleTimes = cardRefs.current.map((_, i) =>
          Math.min(i * 0.4 + 0.5, timeline.duration()),
        );

        if (isMobile) {
          // Mobile: one scroll/swipe gesture = exactly one card settling
          // into place, instead of continuously scrubbing through all
          // of them across one long scroll region (which read as "I
          // scroll and it just scrolls through all the cards" instead of
          // stopping on each one). Same discrete-step approach used for
          // the services 3D section — evenly divides the timeline's
          // total duration into cardCount-1 steps and tweens progress()
          // toward each step on its own gesture, rather than computing
          // this timeline's exact per-card timestamps (its enter/exit
          // tweens overlap, so there's no single clean "card i settled"
          // instant to target directly).
          const STEP_COOLDOWN = 650;
          const WHEEL_THRESHOLD = 12;
          const TOUCH_THRESHOLD = 40;

          let stepIndex = 0;
          let locked = false;
          let touchStartY = null;
          const progressState = { value: 0 };

          const section = containerRef.current;
          let trigger;

          const applyStep = (direction) => {
            if (locked) return;
            const nextIndex = gsap.utils.clamp(
              0,
              cardCount - 1,
              stepIndex + direction,
            );
            if (nextIndex === stepIndex) return;

            locked = true;
            stepIndex = nextIndex;
            // Anchored to this card's actual settled instant (see
            // cardSettleTimes above), not an even fraction of the
            // timeline's total duration.
            const targetTime = cardSettleTimes[stepIndex];

            gsap.to(progressState, {
              value: targetTime,
              duration: 0.9,
              ease: "power2.inOut",
              onUpdate: () => {
                timeline.time(progressState.value);
              },
            });

            setTimeout(() => {
              locked = false;
            }, STEP_COOLDOWN);
          };

          // Edge checks run before the lock check, always, so a gesture
          // that arrives while the previous step's cooldown is still
          // active can still release the pin immediately instead of
          // silently doing nothing (which was forcing an extra, seemingly
          // wasted scroll before the release actually registered).
          const isAtEdge = (direction) =>
            (direction > 0 && stepIndex === cardCount - 1) ||
            (direction < 0 && stepIndex === 0);

          const releasePastEdge = (direction) => {
            const scrollerEl = trigger.scroller;
            const targetScroll =
              direction > 0
                ? trigger.start + (trigger.end - trigger.start) + 1
                : trigger.start - 1;
            if (scrollerEl === window) {
              window.scrollTo({ top: targetScroll, behavior: "auto" });
            } else {
              scrollerEl.scrollTop = targetScroll;
            }
          };

          const handleWheel = (e) => {
            if (!trigger.isActive) return;
            const direction = e.deltaY > 0 ? 1 : -1;
            if (isAtEdge(direction)) {
              e.preventDefault();
              releasePastEdge(direction);
              return;
            }
            e.preventDefault();
            if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
            applyStep(direction);
          };

          const handleTouchStart = (e) => {
            touchStartY = e.touches[0]?.clientY ?? null;
          };

          const handleTouchMove = (e) => {
            if (!trigger.isActive || touchStartY === null) return;
            const currentY = e.touches[0]?.clientY ?? touchStartY;
            const direction = touchStartY - currentY > 0 ? 1 : -1;
            if (isAtEdge(direction)) return;
            e.preventDefault();
          };

          const handleTouchEnd = (e) => {
            if (!trigger.isActive || touchStartY === null) return;
            const endY = e.changedTouches[0]?.clientY ?? touchStartY;
            const deltaY = touchStartY - endY;
            touchStartY = null;
            if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
            const direction = deltaY > 0 ? 1 : -1;
            if (isAtEdge(direction)) {
              releasePastEdge(direction);
              return;
            }
            applyStep(direction);
          };

          section.addEventListener("wheel", handleWheel, { passive: false });
          section.addEventListener("touchstart", handleTouchStart, {
            passive: true,
          });
          section.addEventListener("touchmove", handleTouchMove, {
            passive: false,
          });
          section.addEventListener("touchend", handleTouchEnd, {
            passive: true,
          });

          trigger = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: `+=${cardCount * 100}%`,
            pin: true,
          });

          removeStepGestureListeners = () => {
            section.removeEventListener("wheel", handleWheel);
            section.removeEventListener("touchstart", handleTouchStart);
            section.removeEventListener("touchmove", handleTouchMove);
            section.removeEventListener("touchend", handleTouchEnd);
          };
        } else {
          ScrollTrigger.create({
            animation: timeline,
            trigger: containerRef.current,
            pin: true,
            scrub: 1,
            start: "top top",
            end: `+=${timeline.duration() * 100}%`,
            invalidateOnRefresh: true,
          });
        }
      }, containerRef);
    })();

    return () => {
      isMounted = false;

      if (removeStepGestureListeners) removeStepGestureListeners();
      if (gsapInstance && tickerFn) {
        gsapInstance.ticker.remove(tickerFn);
      }
      if (lenis) {
        lenis.destroy();
      }
      if (gsapCtx) {
        // Reverts all animations AND kills the ScrollTriggers created
        // inside this context.
        gsapCtx.revert();
      }
      // Defensive: in dev/Strict Mode, ensure no orphaned ScrollTrigger
      // instances survive a fast mount/unmount/mount cycle.
      if (scrollTriggerInstance) {
        scrollTriggerInstance
          .getAll()
          .filter((st) => st.trigger === containerRef.current)
          .forEach((st) => st.kill());
      }
    };
  }, []);

  return (
    <>
      <div className="aboutUsStack" ref={containerRef}>
        <div className="counterStack">
          {COUNTER_LABELS.map((label, index) => (
            <Fragment key={label}>
              <p ref={setCounterRef}>{label}</p>
              {index < COUNTER_LABELS.length - 1 && (
                <div className="lineFill" ref={setLineRef} />
              )}
            </Fragment>
          ))}
        </div>

        {CARDS.map((card, index) => (
          <div
            key={card.id}
            ref={setCardRef}
            className="cardsStack"
            style={{
              transform: index === 0 ? "translateY(0%)" : "translateY(150%)",
            }}
          >
            <div className="upperHeadingStack">
              <span>{card.tag}</span>
              <h1>{card.title}</h1>
            </div>

            <video muted loop autoPlay playsInline preload="metadata">
              <source src={card.video} type="video/mp4" />
            </video>

            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
