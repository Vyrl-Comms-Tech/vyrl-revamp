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

      ScrollTrigger.create({
        trigger: sectionMainRef.current,
        start: "25% top",
        end: "75% top",
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={sectionMainRef} className="vyrl-main-wrapper">
        <div className="vyrl-service-about-container">
          <h1 className="vyrl-service-about-text1" ref={textLeftRef}>
            More Than
          </h1>
          <h1 className="vyrl-service-about-text2" ref={textRightRef}>
            JUST DESIGN
          </h1>
        </div>

        <div className="vyrl-section-about-image" ref={imageRef}>
          <img src="/img1.jpg" alt="" />
        </div>

        {/* Cards — ALAG overlay layer, image se bahar */}
        <div className="vyrl-sections-cards-div">
          <div className="card-wrapper">
            <div className="card-inner-wrapper">
              <div className="vyrl-section-card1" ref={card1Ref}>
                <h1>How We Work</h1>
                <p>
                  From idea to execution, our process is collaborative,
                  transparent, and designed to ensure every detail aligns with
                  your goals.
                </p>
              </div>
              <div className="vyrl-section-card2" ref={card2Ref}>
                <h1>Why Vyrl</h1>
                <p>
                  We don't just deliver projects—we build partnerships. Our
                  focus is on understanding your vision and turning it into
                  something meaningful and impactful.
                </p>
              </div>
              <div className="vyrl-section-card3" ref={card3Ref}>
                <h1>Our Approach</h1>
                <p>
                  We combine strategy, creativity, and technology to build
                  solutions that are not only visually striking but
                  purpose-driven and results-focused.
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
