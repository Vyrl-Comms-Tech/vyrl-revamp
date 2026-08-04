// "use client";
// import React, { useEffect, useRef } from "react";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import TextAnimation from "./TextAnimation";
// import "../../styles/text-and-cards.css";
// import CtaButton from "../layout/cta";

// gsap.registerPlugin(ScrollTrigger);

// const CARDS = [
//   {
//     id: 1,
//     title: "Strategy",
//     dark: true,
//     image: null,
//     video: "/video02_compressed.mp4",
//     desc: "Direction that connects brand, audience, and business goals.",
//   },
//   {
//     id: 2,
//     title: "Technology",
//     dark: false,
//     image: null,
//     video: null,
//     desc: "Websites, apps, platforms, and automation built to perform.",
//   },
//   {
//     id: 3,
//     title: "Performance",
//     dark: true,
//     image: null,
//     video: "/video01_compressed.mp4",
//     desc: "Content, campaigns, and media systems designed to drive measurable growth",
//   },
// ];

// export default function TextAndCards() {
//   const cardsRef = useRef(null);

//   useGSAP(
//     () => {
//       const cardEls = gsap.utils.toArray(".hs-card");

//       gsap.set(cardEls, {
//         rotateX: -88,
//         y: 390,
//         opacity: 0,
//         scale: 0.92,
//         transformOrigin: "center center",
//         transformStyle: "preserve-3d",
//         force3D: true,
//       });

//       const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
//       tl.to(cardEls, {
//         rotateX: 0,
//         y: 0,
//         z: 0,
//         opacity: 1,
//         scale: 1,
//         duration: 1.4,
//         stagger: { each: 0.18, ease: "power2.out" },
//       });

//       ScrollTrigger.create({
//         trigger: cardsRef.current,
//         start: "top 70%",
//         end: "+=700",
//         scrub: 1.8,
//         animation: tl,
//         invalidateOnRefresh: true,
//       });
//     },
//     { scope: cardsRef },
//   );

//   // This section renders eagerly (right after the hero, not behind
//   // LazySection), so both card videos start decoding/playing the
//   // instant the page loads — and kept playing indefinitely even once
//   // scrolled past, all the way down through Logos/ClientReviews/
//   // Collective. Pausing them once they're off-screen (and resuming on
//   // return) cuts that to only the time they're actually visible.
//   useEffect(() => {
//     const section = cardsRef.current;
//     if (!section) return;

//     const videos = Array.from(section.querySelectorAll("video"));
//     if (!videos.length) return;

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         videos.forEach((video) => {
//           if (entry.isIntersecting) {
//             video.play().catch(() => {});
//           } else {
//             video.pause();
//           }
//         });
//       },
//       { threshold: 0.1 },
//     );

//     observer.observe(section);
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <>
//       <div className="hs-spacer" />
//       <div className="text-and-cards">
//         <section className="hs-text-section">
//           <div className="hs-text-inner">
//             <TextAnimation animateOnScroll={true} delay={0.3}>
//               <h1 className="hs-heading">
//                 <span className="hs-heading-indent" aria-hidden="true" />
//                 Vyrl is a full-stack digital agency building connected
//                 ecosystems across strategy, branding, content, technology,
//                 performance, and automation, designed for brands that want to
//                 stand out, scale, and stay remembered.
//               </h1>
//             </TextAnimation>

//             <CtaButton label="About us" videoSrc="/bg-v-compressed.mp4" href="/about" />
//           </div>
//         </section>

//         <section ref={cardsRef} className="hs-cards-section">
//           <div className="hs-cards-grid">
//             {CARDS.map((card) => (
//               <div
//                 key={card.id}
//                 className={`hs-card ${card.dark ? "hs-card--dark" : "hs-card--light"} ${
//                   card.id === 1 ? "hs-card--small-video" : ""
//                 }`}
//               >
//                 <h2 className="hs-card-title">{card.title}</h2>

//                 <div className="hs-card-media">
//                   {card.image && (
//                     <img
//                       src={card.image}
//                       alt={card.title}
//                       className="hs-card-media-el"
//                       draggable={false}
//                     />
//                   )}
//                   {card.video && (
//                     <video
//                       className="hs-card-media-el"
//                       autoPlay
//                       muted
//                       loop
//                       playsInline
//                       preload="metadata"
//                     >
//                       <source src={card.video} type="video/mp4" />
//                     </video>
//                   )}
//                 </div>

//                 <p className="hs-card-desc">{card.desc}</p>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//     </>
//   );
// }

// "use client";

// import React, { useEffect, useRef } from "react";
// import { useGSAP } from "@gsap/react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// import TextAnimation from "./TextAnimation";
// import "../../styles/text-and-cards.css";
// import CtaButton from "../layout/cta";

// gsap.registerPlugin(ScrollTrigger);

// const CARDS = [
//   {
//     id: 1,
//     title: "Strategy",
//     dark: true,
//     video: "/video02_compressed.mp4",
//     desc: "Direction that connects brand, audience, and business goals.",
//   },
//   {
//     id: 2,
//     title: "Technology",
//     dark: false,
//     video: null,
//     desc: "Websites, apps, platforms, and automation built to perform.",
//   },
//   {
//     id: 3,
//     title: "Performance",
//     dark: true,
//     video: "/video01_compressed.mp4",
//     desc: "Content, campaigns, and media systems designed to drive measurable growth.",
//   },
// ];

// export default function TextAndCards() {
//   const cardsRef = useRef(null);

//   useGSAP(
//     () => {
//       const cards = gsap.utils.toArray(".hs-card");

//       const mm = gsap.matchMedia();

//       mm.add("(min-width: 768px)", () => {
//         gsap.fromTo(
//           cards,
//           {
//             rotateX: -25,
//             y: 120,
//             opacity: 0,
//             scale: 0.96,
//             transformOrigin: "center bottom",
//           },
//           {
//             rotateX: 0,
//             y: 0,
//             opacity: 1,
//             scale: 1,
//             stagger: 0.12,
//             ease: "none",

//             scrollTrigger: {
//               trigger: cardsRef.current,
//               start: "top 80%",
//               end: "top 30%",
//               scrub: 0.5,
//               invalidateOnRefresh: true,
//             },

//             onComplete: () => {
//               gsap.set(cards, {
//                 clearProps: "transform,willChange",
//               });
//             },
//           },
//         );
//       });

//       // Use a simpler animation on mobile.
//       mm.add("(max-width: 767px)", () => {
//         gsap.fromTo(
//           cards,
//           {
//             y: 60,
//             opacity: 0,
//           },
//           {
//             y: 0,
//             opacity: 1,
//             stagger: 0.1,
//             duration: 0.6,
//             ease: "power2.out",

//             scrollTrigger: {
//               trigger: cardsRef.current,
//               start: "top 85%",
//               toggleActions: "play none none reverse",
//             },

//             onComplete: () => {
//               gsap.set(cards, {
//                 clearProps: "transform,willChange",
//               });
//             },
//           },
//         );
//       });

//       return () => mm.revert();
//     },
//     {
//       scope: cardsRef,
//     },
//   );

//   useEffect(() => {
//     const section = cardsRef.current;
//     if (!section) return;

//     const videos = Array.from(section.querySelectorAll("video"));

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const video = entry.target;

//           if (entry.isIntersecting) {
//             video.play().catch(() => {
//               // Autoplay may be blocked by the browser.
//             });
//           } else {
//             video.pause();
//           }
//         });
//       },
//       {
//         threshold: 0.25,
//         rootMargin: "100px 0px",
//       },
//     );

//     // Observe each video individually.
//     videos.forEach((video) => observer.observe(video));

//     return () => {
//       videos.forEach((video) => {
//         observer.unobserve(video);
//         video.pause();
//       });

//       observer.disconnect();
//     };
//   }, []);

//   return (
//     <>
//       <div className="hs-spacer" />

//       <div className="text-and-cards">
//         <section className="hs-text-section">
//           <div className="hs-text-inner">
//             <TextAnimation animateOnScroll delay={0.3}>
//               <h1 className="hs-heading">
//                 <span className="hs-heading-indent" aria-hidden="true" />
//                 Vyrl is a full-stack digital agency building connected
//                 ecosystems across strategy, branding, content, technology,
//                 performance, and automation, designed for brands that want to
//                 stand out, scale, and stay remembered.
//               </h1>
//             </TextAnimation>

//             <CtaButton
//               label="About us"
//               videoSrc="/bg-v-compressed.mp4"
//               href="/about"
//             />
//           </div>
//         </section>

//         <section ref={cardsRef} className="hs-cards-section">
//           <div className="hs-cards-grid">
//             {CARDS.map((card) => (
//               <article
//                 key={card.id}
//                 className={[
//                   "hs-card",
//                   card.dark ? "hs-card--dark" : "hs-card--light",
//                   card.id === 1 ? "hs-card--small-video" : "",
//                 ]
//                   .filter(Boolean)
//                   .join(" ")}
//               >
//                 <h2 className="hs-card-title">{card.title}</h2>

//                 <div className="hs-card-media">
//                   {card.video && (
//                     <video
//                       className="hs-card-media-el"
//                       muted
//                       loop
//                       playsInline
//                       preload="metadata"
//                       disablePictureInPicture
//                       aria-hidden="true"
//                     >
//                       <source src={card.video} type="video/mp4" />
//                     </video>
//                   )}
//                 </div>

//                 <p className="hs-card-desc">{card.desc}</p>
//               </article>
//             ))}
//           </div>
//         </section>
//       </div>
//     </>
//   );
// }

"use client";

import React, { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VanillaTilt from "vanilla-tilt";

import TextAnimation from "./TextAnimation";
import "../../styles/text-and-cards.css";
import CtaButton from "../layout/cta";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    id: 1,
    title: "Strategy",
    dark: true,
    video: "/video02_compressed.mp4",
    poster: "/video02_compressed.avif",
    desc: "Direction that connects brand, audience, and business goals.",
  },
  {
    id: 2,
    title: "Technology",
    dark: false,
    video: null,
    desc: "Websites, apps, platforms, and automation built to perform.",
  },
  {
    id: 3,
    title: "Performance",
    dark: true,
    video: "/video01_compressed.mp4",
    poster: "/video01_compressed.avif",
    desc: "Content, campaigns, and media systems designed to drive measurable growth.",
  },
];

export default function TextAndCards() {
  const cardsRef = useRef(null);
  useGSAP(
    () => {
      const section = cardsRef.current;

      if (!section) return;

      const cards = gsap.utils.toArray(".hs-card", section);
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions;

          if (!desktop || reduceMotion) {
            gsap.set(cards, {
              opacity: 1,
              clearProps: "transform",
            });

            return;
          }

          // A client-side route navigation (nav link away and back to
          // "/") remounts this component and creates a fresh
          // ScrollTrigger — but GSAP keeps a global registry of every
          // ScrollTrigger instance ever created, keyed loosely by
          // trigger element. If the PREVIOUS instance's cleanup
          // (mm.revert() below) didn't fully unregister its old
          // ScrollTrigger before this new one is created — plausible
          // given the view-transition's own async DOM swap timing —
          // the new trigger can end up shadowed/conflicting with a
          // dead one still watching the same element, so it never
          // fires (reproduced: cards stuck at opacity 0 after
          // navigating away and back via a nav link). Killing any
          // pre-existing ScrollTriggers on this exact section before
          // creating the new one guarantees a clean slate every mount.
          ScrollTrigger.getAll()
            .filter((st) => st.trigger === section)
            .forEach((st) => st.kill());

          const animation = gsap.fromTo(
            cards,
            {
              y: 120,
              rotateX: -28,
              scale: 0.96,
              opacity: 0,
              transformPerspective: 1200,
              transformOrigin: "50% 100%",
            },
            {
              y: 0,
              rotateX: 0,
              scale: 1,
              opacity: 1,
              duration: 1.15,
              stagger: 0.12,
              ease: "power3.out",
              force3D: true,
              overwrite: "auto",

              scrollTrigger: {
                trigger: section,
                start: "top 82%",
                once: true,
              },

              onStart: () => {
                gsap.set(cards, {
                  willChange: "transform, opacity",
                });
              },

              onComplete: () => {
                gsap.set(cards, {
                  clearProps: "transform,opacity,willChange",
                });
              },
            },
          );

          return () => {
            animation.kill();
          };
        },
      );

      return () => {
        mm.revert();
      };
    },
    {
      scope: cardsRef,
    },
  );

  // Back/forward navigation (Chrome's back button) can restore this page
  // from bfcache instead of remounting it — React effects don't re-run,
  // so if the entrance tween above was caught mid-flight when the page
  // was frozen (GSAP's ticker pauses along with everything else), the
  // cards come back frozen at whatever half-finished opacity/transform
  // they were at, instead of their resolved resting state. `pageshow`'s
  // `persisted` flag is what tells us this was a bfcache restore (a
  // normal load fires pageshow too, but with persisted: false); snapping
  // every card to its final CSS state and refreshing ScrollTrigger's
  // measurements covers it without needing to resume the exact tween.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (!event.persisted) return;

      const section = cardsRef.current;
      if (!section) return;

      const cards = gsap.utils.toArray(".hs-card", section);
      gsap.set(cards, { clearProps: "transform,opacity,willChange" });
      ScrollTrigger.refresh();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    const section = cardsRef.current;

    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const cards = Array.from(section.querySelectorAll(".hs-card"));

    VanillaTilt.init(cards, {
      max: 10,
      speed: 400,
      perspective: 1000,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      reverse: true,
      glare: true,
      "max-glare": 0.1,
      gyroscope: false,
    });

    return () => {
      cards.forEach((card) => card.vanillaTilt?.destroy());
    };
  }, []);

  useEffect(() => {
    const section = cardsRef.current;

    if (!section) return;

    const videos = Array.from(section.querySelectorAll("video[data-src]"));

    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            // Load the video only when it approaches the viewport.
            if (!video.src) {
              video.src = video.dataset.src;
              video.load();
            }

            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "150px 0px",
      },
    );

    videos.forEach((video) => {
      observer.observe(video);
    });

    return () => {
      observer.disconnect();

      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
    };
  }, []);

  return (
    <div className="text-and-cards">
      <section className="hs-text-section">
        <div className="hs-text-inner">
          <TextAnimation animateOnScroll delay={0.15}>
            <h1 className="hs-heading">
              <span className="hs-heading-indent" aria-hidden="true" />
              Vyrl is a full-stack digital agency building connected ecosystems
              across strategy, branding, content, technology, performance, and
              automation, designed for brands that want to stand out, scale, and
              stay remembered.
            </h1>
          </TextAnimation>

          <CtaButton
            label="About us"
            videoSrc="/bg-v-compressed.mp4"
            href="/about"
          />
        </div>
      </section>

      <section ref={cardsRef} className="hs-cards-section">
        <div className="hs-cards-grid">
          {CARDS.map((card) => (
            <article
              key={card.id}
              className={[
                "hs-card",
                card.dark ? "hs-card--dark" : "hs-card--light",
                card.id === 1 ? "hs-card--small-video" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {card.video && (
                <div className="hs-card-media">
                  <video
                    className="hs-card-media-el"
                    data-src={card.video}
                    poster={card.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    disablePictureInPicture
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="hs-card-content">
                <h2 className="hs-card-title">{card.title}</h2>
                <p className="hs-card-desc">{card.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
