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
//     video: "/smiley.mp4",
//     description:
//       "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
//   },
//   {
//     id: "video-4",
//     tag: "Creative",
//     title: "second Centered",
//     video: "/video01.mp4",
//     description:
//       "second  is shaped around your business, audience, goals, and the next stage of your growth.",
//   },
//   {
//     id: "video-3",
//     tag: "Creative",
//     title: "third Centered",
//     video: "/video02.mp4",
//     description:
//       "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
//   },
//   {
//     id: "video-2",
//     tag: "Creative",
//     title: "fourth Centered",
//     video: "/smiley.mp4",
//     description:
//       "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
//   }, {
//     id: "video-2",
//     tag: "Creative",
//     title: "Client Centered",
//     video: "/video02.mp4",
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
    tag: "Creative",
    title: "first Centered",
    video: "/smiley.mp4",
    description:
      "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
  },
  {
    id: "video-4",
    tag: "Creative",
    title: "second Centered",
    video: "/video01.mp4",
    description:
      "second  is shaped around your business, audience, goals, and the next stage of your growth.",
  },
  {
    id: "video-3",
    tag: "Creative",
    title: "third Centered",
    video: "/video02.mp4",
    description:
      "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
  },
  {
    id: "video-2",
    tag: "Creative",
    title: "fourth Centered",
    video: "/smiley.mp4",
    description:
      "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
  }, {
    id: "video-2",
    tag: "Creative",
    title: "Client Centered",
    video: "/video02.mp4",
    description:
      "Every strategy is shaped around your business, audience, goals, and the next stage of your growth.",
  },
];

const COUNTER_LABELS = ["00", "01", "02", "03", "04"];

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

        const isMobile = window.innerWidth <= 700;
        const lastIndex = cardRefs.current.length - 1;

        // Mobile: cards before the last one enter then exit (go up) as
        // normal, but the last card enters and STAYS — no exit tweens
        // are added for it, so the timeline's total duration is exactly
        // "everything up through the last card settling in," with no
        // trailing dead time. That's then used as the pin's scroll
        // distance directly, instead of a hardcoded guess, so there's
        // no blank pinned scroll after the last card before the next
        // section appears.
        const exitingCards = isMobile
          ? cardRefs.current.slice(0, lastIndex)
          : cardRefs.current;
        const lastCard = cardRefs.current[lastIndex];

        const timeline = gsap.timeline({ paused: true });

        timeline
          .to(cardRefs.current, { y: 0, scale: 1, stagger: 0.4 })
          .to(
            exitingCards,
            { y: -300, opacity: 0.5, scale: 0.5, stagger: 0.4 },
            "0.5"
          )
          .to(
            exitingCards,
            { y: -600, scale: 0.1, opacity: 0, stagger: 0.4 },
            "1"
          )
          .to(
            lineRefs.current,
            { height: "4rem", opacity: 1, stagger: 0.4 },
            "0.1"
          )
          .to(
            lineRefs.current,
            { height: "1rem", opacity: 0.4, stagger: 0.4 },
            "0.6"
          )
          .to(counterRefs.current, { color: "#000", stagger: 0.4 }, "0.2");

        if (isMobile && lastCard) {
          // A brief hold once the last card is fully in place, so it
          // reads as a deliberate stop rather than a flash before the
          // pin releases.
          timeline.to(lastCard, { scale: 1 }, ">+=0.3");
        }

        ScrollTrigger.create({
          animation: timeline,
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: isMobile
            ? `+=${timeline.duration() * 100}%`
            : "+=400% bottom",
          invalidateOnRefresh: true,
        });
      }, containerRef);
    })();

    return () => {
      isMounted = false;

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