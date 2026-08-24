// // "use client";

// // import { useRef } from "react";
// // import Image from "next/image";
// // import gsap from "gsap";
// // import { ScrollTrigger } from "gsap/ScrollTrigger";
// // import { useGSAP } from "@gsap/react";
// // import "../../styles/partner-section.css";
// // import { partners } from "./partners";

// // gsap.registerPlugin(ScrollTrigger);

// // /**
// //  * PartnersSection
// //  * ----------------
// //  * "Our clients" logo grid. Client Component (see the scroll-scrubbed
// //  * backgroundColor tween below) — same fromTo + scrollTrigger pattern as
// //  * HomeCarousel.jsx's fade-to-black and Collective.jsx's reverse of it:
// //  * explicit from/to colors (not `.from`, which would just read whatever's
// //  * already painted) scrubbed against this section's own arrival into the
// //  * viewport, so the page settles to black smoothly instead of snapping.
// //  *
// //  * Styling is a plain global stylesheet (PartnersSection.css), not a CSS
// //  * Module — class names below are the exact kebab-case selectors defined
// //  * there (.logo-section, .partner-card, etc.), so they're global once
// //  * imported. Keep that in mind if this component is reused on a page that
// //  * defines its own .partner-card class elsewhere — there's no scoping.
// //  *
// //  * App Router note: Next.js only allows importing a *global* stylesheet
// //  * from app/layout.jsx (or another layout), not from an arbitrary component
// //  * file. If you're on the App Router, move the `import "./PartnersSection.css"`
// //  * line into app/layout.jsx instead of leaving it here — otherwise the build
// //  * will error with "Global CSS cannot be imported from files other than your
// //  * Custom <App>". Pages Router has no such restriction.
// //  *
// //  * @param {Object}  props
// //  * @param {string}  [props.year]         Year label shown top-right (e.g. "2024").
// //  * @param {string}  [props.clientCount]  Stat shown bottom-right (e.g. "70+").
// //  * @param {string}  [props.brand]        Brand name shown bottom-left.
// //  */
// // export default function PartnersSection({
// //   year = "2024",
// //   clientCount = "70+",
// //   brand = "VYRL® COMMUNICATIONS",
// // }) {
// //   const sectionRef = useRef(null);

// //   useGSAP(
// //     () => {
// //       const section = sectionRef.current;
// //       if (!section) return;

// //       const tween = gsap.fromTo(
// //         section,
// //         { backgroundColor: "#fcfcfc" },
// //         {
// //           backgroundColor: "#000000",
// //           ease: "none",
// //           scrollTrigger: {
// //             trigger: section,
// //             start: "top bottom",
// //             end: "center center",
// //             scrub: true,
// //           },
// //         },
// //       );

// //       return () => tween.scrollTrigger?.kill();
// //     },
// //     { scope: sectionRef },
// //   );

// //   return (
// //     <section
// //       ref={sectionRef}
// //       className="logo-section"
// //       aria-labelledby="partners-heading"
// //     >
// //       <div className="partners-section">
// //         <header className="partners-top">
// //           <h2 id="partners-heading" className="partners-heading">
// //             Our Clients
// //           </h2>
// //           <span aria-hidden="true">{year}</span>
// //         </header>

// //         <ul className="partners-grid" role="list">
// //           {partners.map(({ name, src, width, height }) => (
// //             <li key={name} className="partner-card">
// //               <Image
// //                 src={src}
// //                 alt={name}
// //                 width={width}
// //                 height={height}
// //                 className="partner-logo"
// //                 loading="lazy"
// //                 sizes="(max-width: 600px) 40vw, (max-width: 900px) 30vw, 22vw"
// //               />
// //             </li>
// //           ))}
// //         </ul>

// //         <div className="partners-bottom">
// //           <span>{brand}</span>
// //           <span>Clients</span>
// //           <span>{clientCount}</span>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }

// "use client";

// import { useEffect, useRef } from "react";
// import Image from "next/image";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import "../../styles/partner-section.css";
// import { partners } from "../../data/partners";
// import { logoPool } from "../../data/logoPool";

// // Registering a browser-only plugin at module scope would break SSR
// // (Next renders client components on the server too) — guard it.
// if (typeof window !== "undefined") {
//   gsap.registerPlugin(ScrollTrigger);
// }

// function shuffle(array) {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// /**
//  * PartnersSection
//  * ----------------
//  * "Our clients" logo grid with:
//  *  1. A scroll-triggered entrance (cards tilt/rise into place).
//  *  2. A continuous background shuffle — every few seconds each card
//  *     cross-fades into a different logo from a rotating pool, giving
//  *     the wall a "live" feel.
//  *
//  * This is a Client Component (GSAP + ScrollTrigger touch the DOM directly
//  * and need timers), unlike the previous static version.
//  *
//  * @param {Object}  props
//  * @param {string}  [props.year]         Year label shown top-right (e.g. "2024").
//  * @param {string}  [props.clientCount]  Stat shown bottom-right (e.g. "70+").
//  * @param {string}  [props.brand]        Brand name shown bottom-left.
//  */
// export default function PartnersSection({
//   year = "2024",
//   clientCount = "70+",
//   brand = "VYRL® COMMUNICATIONS",
// }) {
//   const gridRef = useRef(null);
//   const imgRefs = useRef([]);
//   imgRefs.current = [];

//   const registerImgRef = (el) => {
//     if (el) imgRefs.current.push(el);
//   };

//   useEffect(() => {
//     const prefersReducedMotion = window.matchMedia(
//       "(prefers-reduced-motion: reduce)"
//     ).matches;

//     let cancelled = false;

//     // gsap.context scopes every selector text (".partner-card", etc.) below
//     // to gridRef.current, and ctx.revert() cleans up every tween/ScrollTrigger
//     // created inside it — the React-idiomatic way to avoid leaking GSAP
//     // instances across mounts (important with StrictMode's double-invoke).
//     const ctx = gsap.context(() => {}, gridRef);

//     // This section sits far down the page, after several large pinned
//     // sections (HeroModelSection, Services3d, Work) whose own pin-
//     // spacers can still be settling into their final reserved height at
//     // the moment this component mounts — same class of bug documented in
//     // HeroModelSection.jsx and Work.jsx. Creating the ScrollTrigger
//     // synchronously here measured .partners-grid's position against a
//     // page that hadn't finished growing to its true final height yet, so
//     // "top 85%" was already satisfied at scroll position 0 — the whole
//     // gsap.from() entrance (including its own initial from-state:
//     // opacity 0.2, rotateX -50) had already played before the page even
//     // painted once, which is indistinguishable from "the animation never
//     // ran" since the cards just show up fully settled from the very
//     // first frame.
//     //
//     // Same double-rAF defer Work.jsx already uses for its own per-card
//     // reveals, for the same reason: one rAF only guarantees a repaint
//     // has happened, not that every layout effect above this one (each
//     // with their own async pin-spacer setup) has finished growing the
//     // page — a second rAF gives those one more full frame to settle
//     // before this component measures anything.
//     requestAnimationFrame(() => {
//       if (cancelled) return;
//       requestAnimationFrame(() => {
//         if (cancelled) return;

//         ctx.add(() => {
//           ScrollTrigger.refresh();

//           gsap.from(".partner-card", {
//             rotateX: -50,
//             y: 100,
//             opacity: 0.2,
//             transformOrigin: "50% 100%",
//             stagger: { each: 0.03, from: "start" },
//             duration: 1,
//             ease: "power3.out",
//             scrollTrigger: {
//               // Was the selector string ".partners-grid" — but gridRef
//               // (passed as gsap.context's scope below) IS the
//               // .partners-grid element itself, not an ancestor of it.
//               // gsap.context's scoped selector resolution only searches
//               // *descendants* of the scope root (scope.current.
//               // querySelectorAll(...)), so a selector matching the scope
//               // root itself can never resolve through it — hence the
//               // "Element not found: .partners-grid" warning, and with no
//               // valid trigger element ScrollTrigger had nothing to
//               // measure or watch, so the tween's "from" state (and the
//               // scroll-triggered entrance) never applied at all.
//               // Referencing the ref directly sidesteps scoped-selector
//               // resolution entirely.
//               trigger: gridRef.current,
//               start: "top 85%",
//               // scrub: true with no explicit `end` was the original bug
//               // here — scrub ties the tween's progress directly to
//               // scroll position across whatever range the trigger
//               // covers, but with no `end` GSAP has nothing to scrub
//               // across (defaults to a near-zero-length range at
//               // `start`), so the whole staggered entrance collapsed to
//               // its very first (or very last) frame instantly instead
//               // of ever playing. This is a one-time reveal, not a
//               // scroll-scrubbed animation, so it needs toggleActions
//               // (play once, on the way in) rather than scrub — same
//               // pattern as the per-card reveals in Work.jsx.
//               toggleActions: "play none none none",
//             },
//           });

//           ScrollTrigger.refresh();
//         });
//       });
//     });

//     // Respect reduced-motion: skip the shuffle loop entirely, keep the
//     // (already-disabled-by-CSS) entrance as the only motion.
//     if (prefersReducedMotion) {
//       return () => {
//         cancelled = true; // guards the deferred rAFs above if unmount beats them
//         ctx.revert();
//       };
//     }

//     function changeLogos() {
//       const shuffledLogos = shuffle(logoPool);
//       imgRefs.current.forEach((img, index) => {
//         if (!img) return;
//         gsap.to(img, {
//           opacity: 0,
//           scale: 0.9,
//           y: -8,
//           duration: 0.3,
//           ease: "power2.in",
//           delay: index * 0.08,
//           onComplete: () => {
//             img.src = shuffledLogos[index % shuffledLogos.length];
//             gsap.fromTo(
//               img,
//               { opacity: 0, scale: 1.05, y: 8 },
//               { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
//             );
//           },
//         });
//       });
//     }

//     const firstShuffle = gsap.delayedCall(2, changeLogos);

//     let loopCall;
//     function logoLoop() {
//       changeLogos();
//       loopCall = gsap.delayedCall(5, logoLoop);
//     }
//     const startLoop = gsap.delayedCall(7, logoLoop);

//     return () => {
//       cancelled = true; // guards the deferred rAFs above if unmount beats them
//       ctx.revert();
//       firstShuffle.kill();
//       startLoop.kill();
//       loopCall?.kill();
//       gsap.killTweensOf(imgRefs.current);
//     };
//   }, []);

//   return (
//     <section className="logo-section" aria-labelledby="partners-heading">
//       <div className="partners-section">
//         <header className="partners-top">
//           <h2 id="partners-heading" className="partners-heading">
//             Our Clients
//           </h2>
//           <span aria-hidden="true">{year}</span>
//         </header>

//         {/*
//           The grid shuffles logos continuously and isn't a reliable source
//           of "which brand is this," so the images below are marked
//           decorative (alt="") and the real client roster is exposed once,
//           statically, for assistive tech.
//         */}
//         <p className="sr-only">
//           Clients include {partners.map((p) => p.name).join(", ")}, and others.
//         </p>

//         <ul className="partners-grid" ref={gridRef} role="list" aria-hidden="true">
//           {partners.map(({ name, src, width, height }, index) => (
//             <li key={name} className="partner-card">
//               <Image
//                 ref={registerImgRef}
//                 src={src}
//                 alt=""
//                 width={width}
//                 height={height}
//                 className="partner-logo"
//                 loading={index < 4 ? "eager" : "lazy"}
//                 sizes="(max-width: 600px) 40vw, (max-width: 900px) 30vw, 22vw"
//               />
//             </li>
//           ))}
//         </ul>

//         <div className="partners-bottom">
//           <span>{brand}</span>
//           <span>Clients</span>
//           <span>{clientCount}</span>
//         </div>
//       </div>
//     </section>
//   );
// }

// "use client";

// import { useRef } from "react";
// import Image from "next/image";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { useGSAP } from "@gsap/react";
// import "../../styles/partner-section.css";
// import { partners } from "./partners";

// gsap.registerPlugin(ScrollTrigger);

// /**
//  * PartnersSection
//  * ----------------
//  * "Our clients" logo grid. Client Component (see the scroll-scrubbed
//  * backgroundColor tween below) — same fromTo + scrollTrigger pattern as
//  * HomeCarousel.jsx's fade-to-black and Collective.jsx's reverse of it:
//  * explicit from/to colors (not `.from`, which would just read whatever's
//  * already painted) scrubbed against this section's own arrival into the
//  * viewport, so the page settles to black smoothly instead of snapping.
//  *
//  * Styling is a plain global stylesheet (PartnersSection.css), not a CSS
//  * Module — class names below are the exact kebab-case selectors defined
//  * there (.logo-section, .partner-card, etc.), so they're global once
//  * imported. Keep that in mind if this component is reused on a page that
//  * defines its own .partner-card class elsewhere — there's no scoping.
//  *
//  * App Router note: Next.js only allows importing a *global* stylesheet
//  * from app/layout.jsx (or another layout), not from an arbitrary component
//  * file. If you're on the App Router, move the `import "./PartnersSection.css"`
//  * line into app/layout.jsx instead of leaving it here — otherwise the build
//  * will error with "Global CSS cannot be imported from files other than your
//  * Custom <App>". Pages Router has no such restriction.
//  *
//  * @param {Object}  props
//  * @param {string}  [props.year]         Year label shown top-right (e.g. "2024").
//  * @param {string}  [props.clientCount]  Stat shown bottom-right (e.g. "70+").
//  * @param {string}  [props.brand]        Brand name shown bottom-left.
//  */
// export default function PartnersSection({
//   year = "2024",
//   clientCount = "70+",
//   brand = "VYRL® COMMUNICATIONS",
// }) {
//   const sectionRef = useRef(null);

//   useGSAP(
//     () => {
//       const section = sectionRef.current;
//       if (!section) return;

//       const tween = gsap.fromTo(
//         section,
//         { backgroundColor: "#fcfcfc" },
//         {
//           backgroundColor: "#000000",
//           ease: "none",
//           scrollTrigger: {
//             trigger: section,
//             start: "top bottom",
//             end: "center center",
//             scrub: true,
//           },
//         },
//       );

//       return () => tween.scrollTrigger?.kill();
//     },
//     { scope: sectionRef },
//   );

//   return (
//     <section
//       ref={sectionRef}
//       className="logo-section"
//       aria-labelledby="partners-heading"
//     >
//       <div className="partners-section">
//         <header className="partners-top">
//           <h2 id="partners-heading" className="partners-heading">
//             Our Clients
//           </h2>
//           <span aria-hidden="true">{year}</span>
//         </header>

//         <ul className="partners-grid" role="list">
//           {partners.map(({ name, src, width, height }) => (
//             <li key={name} className="partner-card">
//               <Image
//                 src={src}
//                 alt={name}
//                 width={width}
//                 height={height}
//                 className="partner-logo"
//                 loading="lazy"
//                 sizes="(max-width: 600px) 40vw, (max-width: 900px) 30vw, 22vw"
//               />
//             </li>
//           ))}
//         </ul>

//         <div className="partners-bottom">
//           <span>{brand}</span>
//           <span>Clients</span>
//           <span>{clientCount}</span>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/partner-section.css";
import { partners } from "../../data/partners";
import { logoPool } from "../../data/logoPool";
import TextAnimation from "./TextAnimation";

// Registering a browser-only plugin at module scope would break SSR
// (Next renders client components on the server too) — guard it.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * PartnersSection
 * ----------------
 * "Our clients" logo grid with:
 *  1. A scroll-triggered entrance (cards tilt/rise into place).
 *  2. A continuous background shuffle — every few seconds each card
 *     cross-fades into a different logo from a rotating pool, giving
 *     the wall a "live" feel.
 *
 * This is a Client Component (GSAP + ScrollTrigger touch the DOM directly
 * and need timers), unlike the previous static version.
 *
 * @param {Object}  props
 * @param {string}  [props.year]         Year label shown top-right (e.g. "2024").
 * @param {string}  [props.clientCount]  Stat shown bottom-right (e.g. "70+").
 * @param {string}  [props.brand]        Brand name shown bottom-left.
 */
export default function PartnersSection({
  year = "2024",
  clientCount = "70+",
  brand = "VYRL® COMMUNICATIONS",
}) {
  const gridRef = useRef(null);
  const imgRefs = useRef([]);
  imgRefs.current = [];

  const registerImgRef = (el) => {
    if (el) imgRefs.current.push(el);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cancelled = false;

    // gsap.context scopes every selector text (".partner-card", etc.) below
    // to gridRef.current, and ctx.revert() cleans up every tween/ScrollTrigger
    // created inside it — the React-idiomatic way to avoid leaking GSAP
    // instances across mounts (important with StrictMode's double-invoke).
    const ctx = gsap.context(() => {}, gridRef);

    // This section sits far down the page, after several large pinned
    // sections (HeroModelSection, Services3d, Work) whose own pin-
    // spacers can still be settling into their final reserved height at
    // the moment this component mounts — same class of bug documented in
    // HeroModelSection.jsx and Work.jsx. Creating the ScrollTrigger
    // synchronously here measured .partners-grid's position against a
    // page that hadn't finished growing to its true final height yet, so
    // "top 85%" was already satisfied at scroll position 0 — the whole
    // gsap.from() entrance (including its own initial from-state:
    // opacity 0.2, rotateX -50) had already played before the page even
    // painted once, which is indistinguishable from "the animation never
    // ran" since the cards just show up fully settled from the very
    // first frame.
    //
    // Same double-rAF defer Work.jsx already uses for its own per-card
    // reveals, for the same reason: one rAF only guarantees a repaint
    // has happened, not that every layout effect above this one (each
    // with their own async pin-spacer setup) has finished growing the
    // page — a second rAF gives those one more full frame to settle
    // before this component measures anything.
    requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;

        ctx.add(() => {
          ScrollTrigger.refresh();

          gsap.from(".partner-card", {
            rotateX: -50,
            y: 100,
            opacity: 0.2,
            transformOrigin: "50% 100%",
            stagger: { each: 0.03, from: "start" },
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              // Was the selector string ".partners-grid" — but gridRef
              // (passed as gsap.context's scope below) IS the
              // .partners-grid element itself, not an ancestor of it.
              // gsap.context's scoped selector resolution only searches
              // *descendants* of the scope root (scope.current.
              // querySelectorAll(...)), so a selector matching the scope
              // root itself can never resolve through it — hence the
              // "Element not found: .partners-grid" warning, and with no
              // valid trigger element ScrollTrigger had nothing to
              // measure or watch, so the tween's "from" state (and the
              // scroll-triggered entrance) never applied at all.
              // Referencing the ref directly sidesteps scoped-selector
              // resolution entirely.
              trigger: gridRef.current,
              start: "top 85%",
              // scrub: true with no explicit `end` was the original bug
              // here — scrub ties the tween's progress directly to
              // scroll position across whatever range the trigger
              // covers, but with no `end` GSAP has nothing to scrub
              // across (defaults to a near-zero-length range at
              // `start`), so the whole staggered entrance collapsed to
              // its very first (or very last) frame instantly instead
              // of ever playing. This is a one-time reveal, not a
              // scroll-scrubbed animation, so it needs toggleActions
              // (play once, on the way in) rather than scrub — same
              // pattern as the per-card reveals in Work.jsx.
              toggleActions: "play none none none",
            },
          });

          ScrollTrigger.refresh();
        });
      });
    });

    // Respect reduced-motion: skip the shuffle loop entirely, keep the
    // (already-disabled-by-CSS) entrance as the only motion.
    if (prefersReducedMotion) {
      return () => {
        cancelled = true; // guards the deferred rAFs above if unmount beats them
        ctx.revert();
      };
    }

    function changeLogos() {
      const shuffledLogos = shuffle(logoPool);
      imgRefs.current.forEach((img, index) => {
        if (!img) return;
        gsap.to(img, {
          opacity: 0,
          scale: 0.9,
          y: -8,
          duration: 0.3,
          ease: "power2.in",
          delay: index * 0.08,
          onComplete: () => {
            img.src = shuffledLogos[index % shuffledLogos.length];
            gsap.fromTo(
              img,
              { opacity: 0, scale: 1.05, y: 8 },
              {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.45,
                ease: "power3.out",
              },
            );
          },
        });
      });
    }

    const firstShuffle = gsap.delayedCall(2, changeLogos);

    let loopCall;
    function logoLoop() {
      changeLogos();
      loopCall = gsap.delayedCall(5, logoLoop);
    }
    const startLoop = gsap.delayedCall(7, logoLoop);

    return () => {
      cancelled = true; // guards the deferred rAFs above if unmount beats them
      ctx.revert();
      firstShuffle.kill();
      startLoop.kill();
      loopCall?.kill();
      gsap.killTweensOf(imgRefs.current);
    };
  }, []);

  return (
    <section className="logo-section" aria-labelledby="partners-heading">
      <div className="partners-section">
        <header className="partners-top">
          <h2 id="partners-heading" className="partners-heading">
            <TextAnimation animateOnScroll={true} delay={0.3}>
              Our Clients
            </TextAnimation>
          </h2>
          <span aria-hidden="true">{year}</span>
        </header>

        {/*
          The grid shuffles logos continuously and isn't a reliable source
          of "which brand is this," so the images below are marked
          decorative (alt="") and the real client roster is exposed once,
          statically, for assistive tech.
        */}
        <p className="sr-only">
          Clients include {partners.map((p) => p.name).join(", ")}, and others.
        </p>

        <ul
          className="partners-grid"
          ref={gridRef}
          role="list"
          aria-hidden="true"
        >
          {partners.map(({ name, src, width, height }, index) => (
            <li key={name} className="partner-card">
              <Image
                ref={registerImgRef}
                src={src}
                alt=""
                width={width}
                height={height}
                className="partner-logo"
                loading={index < 4 ? "eager" : "lazy"}
                sizes="(max-width: 600px) 40vw, (max-width: 900px) 30vw, 22vw"
              />
            </li>
          ))}
        </ul>

        <div className="partners-bottom">
          <span>{brand}</span>
          <span>Clients</span>
          <span>{clientCount}</span>
        </div>
      </div>
    </section>
  );
}
