// "use client";
// import { useEffect, useRef } from "react";
// import "../styles/vyrl-about.css";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

// function VyrlAbout() {
//   const sectionMainRef = useRef<HTMLElement>(null);
//   const imageRef = useRef<HTMLDivElement>(null);
//   const textLeftRef = useRef<HTMLHeadingElement>(null);
//   const textRightRef = useRef<HTMLHeadingElement>(null);

//   const card1Ref = useRef<HTMLDivElement>(null);
//   const card2Ref = useRef<HTMLDivElement>(null);
//   const card3Ref = useRef<HTMLDivElement>(null);

// useEffect(() => {
//     const ctx = gsap.context(() => {

//       // ── PHASE 1: Image slides straight down ─
//       gsap.to(imageRef.current, {
//         y: 280,
//         ease: "none",
//         scrollTrigger: {
//           trigger: sectionMainRef.current,
//           start: "top top",
//           end: "25% top",
//           scrub: 0.5,
//         },
//       });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: sectionMainRef.current,
//           start: "25% top",
//           end: "75% top",
//           pin: true,
//           scrub: 0.5,
//         }
//       });

//       // rest of your timeline stays exactly the same...
//       tl.to(imageRef.current, {
//         width: "95vw",
//         height: "80vh",
//         borderRadius: "6px",
//         top: "15%",
//         ease: "none",
//         duration: 1,
//       })
//         .fromTo(card1Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 })
//         .fromTo(card2Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 })
//         .fromTo(card3Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 });

//       tl.to(textLeftRef.current, {
//         x: () => {
//           const el = textLeftRef.current;
//           const elW = el.offsetWidth;
//           const vw = window.innerWidth;
//           return (vw / 2 - elW - (vw * 0.02)) - 50;
//         },
//         ease: "none",
//       }, 0);

//       tl.to(textRightRef.current, {
//         x: () => {
//           const el = textRightRef.current;;
//           const elW = el.offsetWidth;
//           const vw = window.innerWidth;
//           return (vw / 2 + (vw * 0.02)) - (vw - 50 - elW);
//         },
//         ease: "none",
//       }, 0);
//     });

//     return () => ctx.revert();
//   }, []);

//   return (
//     <>
//       <section ref={sectionMainRef} className="vyrl-main-wrapper">

//         <div className="vyrl-service-about-container">
//           <h1 className="vyrl-service-about-text1" ref={textLeftRef}>More Than</h1>
//           <h1 className="vyrl-service-about-text2" ref={textRightRef}>JUST DESIGN</h1>
//         </div>

//         <div className="vyrl-section-about-image" ref={imageRef}>
//           <img src="/service1.jpg" alt="" />
//         </div>

//         {/* Cards — ALAG overlay layer, image se bahar */}
//         <div className="vyrl-sections-cards-div">
//           <div className="card-wrapper">
//             <div className="card-inner-wrapper">
//               <div className="vyrl-section-card1" ref={card1Ref}>
//                 <h1>How We Work</h1>
//                 <p>From idea to execution, our process is collaborative, transparent, and designed to ensure every detail aligns with your goals.</p>
//               </div>
//               <div className="vyrl-section-card2" ref={card2Ref}>
//                 <h1>Why Vyrl</h1>
//                 <p>We don't just deliver projects—we build partnerships. Our focus is on understanding your vision and turning it into something meaningful and impactful.</p>
//               </div>
//               <div className="vyrl-section-card3" ref={card3Ref}>
//                 <h1>Our Approach</h1>
//                 <p>We combine strategy, creativity, and technology to build solutions that are not only visually striking but purpose-driven and results-focused.</p>
//               </div>
//             </div>
//           </div>
//         </div>

//       </section>
//     </>
//   );
// }

// export default VyrlAbout;

"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/vyrl-about.css";

gsap.registerPlugin(ScrollTrigger);

function VyrlAbout() {
  const sectionMainRef = useRef(null);
  const imageRef = useRef(null);
  const textLeftRef = useRef(null);
  const textRightRef = useRef(null);

  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  useEffect(() => {
    // The pinned scroll choreography (image growing, cards fading in,
    // headings sliding to the edges) assumes desktop-width layout math
    // (vw-based translateX targets, fixed px card widths). On mobile we
    // instead show a simple static stack (see CSS breakpoint), so skip
    // creating any of this scroll-driven animation there.
    if (window.innerWidth <= 760) return;

    const ctx = gsap.context(() => {
      // ─PHASE 1: Image slides straight down ─
      gsap.to(imageRef.current, {
        y: 280,
        ease: "none",
        scrollTrigger: {
          trigger: sectionMainRef.current,
          start: "top top",
          end: "20% top",
          scrub: true,
          // markers: true,
          toggleActions: "play none none none",
          once: true,
        },
      });

      const tl = gsap.timeline({ paused: true });

      tl.to(imageRef.current, {
        width: "95vw",
        height: "70vh",
        borderRadius: "6px",
        top: "15%",
        ease: "none",
        duration: 1,
      })
        .fromTo(card1Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0 })
        .fromTo(card2Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0 })
        .fromTo(card3Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0 });

      tl.to(
        textLeftRef.current,
        {
          x: () => {
            const el = textLeftRef.current;
            const elW = el.offsetWidth;
            const vw = window.innerWidth;
            return vw / 2 - elW - vw * 0.02 - 50;
          },
          ease: "none",
        },
        0,
      );

      tl.to(
        textRightRef.current,
        {
          x: () => {
            const el = textRightRef.current;
            const elW = el.offsetWidth;
            const vw = window.innerWidth;
            return vw / 2 + vw * 0.02 - (vw - 50 - elW);
          },
          ease: "none",
        },
        0,
      );

      // The pin's scroll distance is sized off tl.duration() (now that
      // every tween — image grow, card fades, text slides — has been
      // added) instead of a fixed "75% top" on the 140vh wrapper. That
      // fixed range covered more scroll distance than the timeline
      // actually needed, so once the animation finished there was
      // nothing left to scrub — the section stayed pinned through that
      // leftover scroll with visibly nothing happening, which is what
      // read as "stuck" even after the animation had completed.
      // ~350px of scroll per second of timeline duration is a
      // comfortable pace for this kind of scrub.
      const pinDistance = tl.duration() * 350;

      // pin's own spacer is sized to exactly this scroll distance (via
      // `end`), so once tl reaches progress 1 there's no leftover dead
      // scroll left to sit through — no separate unpin/height-collapse
      // step is needed, and none of the earlier attempts at one (which
      // resized the section mid-scroll-momentum) are safe: they fight
      // the browser's own scroll position at the exact moment the pin
      // is releasing, which is what read as a jump/skip right as the
      // animation finished.
      ScrollTrigger.create({
        trigger: sectionMainRef.current,
        start: "25% top",
        end: `+=${pinDistance}`,
        pin: true,
        // markers: true,

        onUpdate: (self) => {
          // 👇 only move forward, never backward
          const current = tl.progress();
          const next = self.progress;

          if (next > current) {
            tl.progress(next);
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={sectionMainRef} className="vyrl-main-wrapper">
        <div className="vyrl-service-about-container">
          <h1 className="vyrl-service-about-text1" ref={textLeftRef}>
           Built With Trust.
          </h1>
          <h1 className="vyrl-service-about-text2" ref={textRightRef}>
          Proven <br /> Through <br /> Experience.
          </h1>
          {/* <p>lorem</p> */}
        </div>

        <div className="vyrl-section-about-image" ref={imageRef}>
          <div className="vyrl-section-about-image-crop">
            <img src="/img1.jpg" alt="" />
          </div>
          <p className="vyrl-section-about-caption">
            Our clients work with us for more than deliverables. They come to
            Vyrl for clarity, execution, creative thinking, and digital
            systems that help their brands move forward.
          </p>
        </div>

        {/* Cards — ALAG overlay layer, image se bahar */}
        <div className="vyrl-sections-cards-div">
          <div className="card-wrapper">
            <div className="card-inner-wrapper">
              <div className="vyrl-section-card1" ref={card1Ref}>
                <h1>Think Clearly</h1>
                <p>
                  We define the strategy, audience, goals, and digital direction before any creative or technical work begins.
                </p>
              </div>
              <div className="vyrl-section-card2" ref={card2Ref}>
                <h1>Build Boldly</h1>
                <p>
                   We design, develop, create, and execute every layer with a balance of creativity, usability, and performance
                </p>
              </div>
              <div className="vyrl-section-card3" ref={card3Ref}>
                <h1>Improve Constantly</h1>
                <p>
                  We track, refine, optimize, and evolve the work so your digital ecosystem keeps getting stronger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default VyrlAbout;
