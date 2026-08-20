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
import Image from "next/image";
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
  const captionRef = useRef(null);

  // Mobile (<=760px, see vyrl-about.css) renders this section as a
  // plain static stack — no pin, no image-grow, no sliding headings —
  // so it doesn't need any of the desktop scroll choreography below.
  // But it still needs the same document.body black -> white handoff:
  // this section is /services-only and arrives with the page already
  // black (Slider.jsx flips it going in; Services3d/Testimonials hold
  // it — see Testimonials.jsx's isServicesPage guard), and it's the
  // last section before OrbitGallery, which expects the page's normal
  // white background and has no body tween of its own. Split into its
  // own effect (rather than just dropping the desktop early-return)
  // since the mobile version needs a completely different trigger:
  // there's no pin to time against, so this scrubs across the
  // section's own scroll distance directly and completes right as the
  // section is about to end, instead of at its halfway point like the
  // desktop version — mobile's stack is taller and single-column, so
  // "about to end" reads as the natural handoff point to the white
  // OrbitGallery that follows, same way the desktop version times its
  // handoff to land before Services3d's own pin engages.
  useEffect(() => {
    if (window.innerWidth > 760) return;

    const section = sectionMainRef.current;
    if (!section) return;

    const isMountedRef = { current: true };

    const ctx = gsap.context(() => {
      // end: "bottom top" (section's bottom edge reaches the viewport's
      // top edge — i.e. the section has fully scrolled past), not
      // "bottom bottom": on a normal-flow (non-pinned) section taller
      // than the viewport, "bottom bottom" is crossed almost
      // immediately after "top top" (as soon as the section's bottom
      // edge reaches the viewport's own bottom edge, which for an
      // 830px-tall section against an ~844px viewport happens right at
      // the start) — collapsing the whole scrub into a few px of actual
      // scroll distance instead of spanning the section's full height,
      // so the fade jumped straight to its end state the moment the
      // section came into view instead of only near the end of it.
      const bodyTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Runs across the timeline's last 20% only (0.8 -> 1), so the
      // fade doesn't start until the section is genuinely almost done —
      // "about to end", not the middle of it.
      bodyTl.to(
        document.body,
        { background: "#fcfcfc", duration: 0.2, ease: "none" },
        0.8,
      );

      const headings = section.querySelectorAll(
        ".vyrl-service-about-text1, .vyrl-service-about-text2",
      );
      const cardText = section.querySelectorAll(
        ".vyrl-section-card1 h1, .vyrl-section-card1 p, .vyrl-section-card2 h1, .vyrl-section-card2 p, .vyrl-section-card3 h1, .vyrl-section-card3 p",
      );
      if (headings.length || cardText.length) {
        bodyTl.to(
          [...headings, ...cardText],
          { color: "#111111", duration: 0.2, ease: "none" },
          0.8,
        );
      }

      // Same navbar handoff the desktop effect below does, on the same
      // schedule as the body/text fade above — .nav-bar/.menu-dropdown
      // live in a sibling component (Navbar.jsx) that isn't guaranteed
      // to have mounted yet, hence the lazy-lookup-with-poll guard used
      // everywhere else this app reaches across to the navbar.
      let navbarAttempts = 0;
      const addNavbarDarkenTween = () => {
        if (!isMountedRef.current) return;
        const navBar = document.querySelector(".nav-bar");
        const menuDropdown = document.querySelector(".menu-dropdown");
        if (navBar && menuDropdown) {
          bodyTl.to(
            [navBar, menuDropdown],
            { backgroundColor: "#0a0a0a", ease: "power2.inOut" },
            0.8,
          );
          return;
        }
        navbarAttempts += 1;
        if (navbarAttempts < 30) requestAnimationFrame(addNavbarDarkenTween);
      };
      addNavbarDarkenTween();
    }, section);

    return () => {
      isMountedRef.current = false;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    // The pinned scroll choreography (image growing, cards fading in,
    // headings sliding to the edges) assumes desktop-width layout math
    // (vw-based translateX targets, fixed px card widths). On mobile we
    // instead show a simple static stack (see CSS breakpoint), so skip
    // creating any of this scroll-driven animation there.
    if (window.innerWidth <= 760) return;

    // Guards the deferred rAF poll below (navbar darken tween) in case
    // this component unmounts before .nav-bar/.menu-dropdown are found —
    // same isMounted pattern HeroModelSection.jsx uses for its own
    // identical poll.
    const isMountedRef = { current: true };

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
          // once: true,
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
            if (!el) return 0;
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
            if (!el) return 0;
            const elW = el.offsetWidth;
            const vw = window.innerWidth;
            return vw / 2 + vw * 0.02 - (vw - 50 - elW);
          },
          ease: "none",
        },
        0,
      );

      // Caption sits directly below the image (top: 100%) — as the image
      // grows during this same window, that pushes the caption down with
      // it. Left in place, it's still sitting there once the pin
      // releases, reading as debris left behind at the bottom of the
      // section. Sliding it further down and fading it out over this
      // same span means it's fully gone before the pin ever releases.
      if (captionRef.current) {
        tl.to(
          captionRef.current,
          {
            y: 20,
            opacity: 0,
            ease: "none",
            duration: 0.6,
          },
          0,
        );
      }

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
          tl.progress(self.progress);
        },
      });

      // This section is /services-only (see services/page.jsx) and
      // arrives with document.body already black — Slider.jsx flipped it
      // black on the way in, and every section since (Services3d,
      // Testimonials) has held it there (see Testimonials.jsx's
      // isServicesPage guard). VyrlAbout is the last section before
      // OrbitGallery, which expects the page's normal white background
      // (--bodybg, see globals.css) and has no body tween of its own —
      // so something has to hand it back. Same scrub idiom Slider.jsx
      // uses for its own black fade, just reversed and spanning this
      // section's own height instead: start/end cover the section's
      // full scroll distance, and a dummy tween appended after the real
      // one (see Slider.jsx's identical comment) stretches the
      // timeline's total length so the fade completes at the section's
      // scroll-halfway point and holds white for the remainder, rather
      // than fading the whole way to the section's bottom edge.
      const bodyTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionMainRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      bodyTl.to(
        document.body,
        { background: "#fcfcfc", duration: 0.5, ease: "none" },
        0,
      );
 
      bodyTl.to(
        [textLeftRef.current, textRightRef.current],
        { color: "#111111", duration: 0.3, ease: "none" },
        0.2,
      );
      bodyTl.to({}, { duration: 0.5 }, 0.5);

      // Navbar's own resting default is a faint 5%-white tint (see
      // navbar.css) — reads fine against a dark page, but would nearly
      // disappear once document.body above lands on white. Darken it to
      // solid black here, in the same scrub, at the same "0.2" position
      // the heading text above starts darkening — same idiom
      // HeroModelSection.jsx uses for its own navbar tween on its own
      // white-background reveal (search "modelTrigger.to(\n  [navBar,
      // menuDropdown" there).
      //
      // .nav-bar/.menu-dropdown live in a sibling component (Navbar.jsx)
      // that isn't guaranteed to have mounted yet at this exact moment —
      // same lazy-lookup-with-poll guard used everywhere else this app
      // reaches across to the navbar.
      let navbarAttempts = 0;
      const addNavbarDarkenTween = () => {
        if (!isMountedRef.current) return;
        const navBar = document.querySelector(".nav-bar");
        const menuDropdown = document.querySelector(".menu-dropdown");
        if (navBar && menuDropdown) {
          bodyTl.to(
            [navBar, menuDropdown],
            { backgroundColor: "#0a0a0a", ease: "power2.inOut" },
            0.2,
          );
          return;
        }
        navbarAttempts += 1;
        if (navbarAttempts < 30) requestAnimationFrame(addNavbarDarkenTween);
      };
      addNavbarDarkenTween();
    });

    return () => {
      isMountedRef.current = false;
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section ref={sectionMainRef} className="vyrl-main-wrapper">
        <div className="vyrl-service-about-container">
          <h1 className="vyrl-service-about-text1" ref={textLeftRef}>
          built  With Trust
          </h1>
          <h1 className="vyrl-service-about-text2" ref={textRightRef}>
            Through Experience
          </h1>
          {/* <p>lorem</p> */}
        </div>

        <div className="vyrl-section-about-image" ref={imageRef}>
          <div className="vyrl-section-about-image-crop">
            <Image src="/vyrl-about1.jpg" alt="" fill className="object-cover" sizes="634px" />
          </div>
          <p className="vyrl-section-about-caption" ref={captionRef}>
            Our clients work with us for more than deliverables. They come to
            Vyrl for clarity, execution, creative thinking, and digital systems
            that help their brands move forward.
          </p>
        </div>

        {/* Cards — ALAG overlay layer, image se bahar */}
        <div className="vyrl-sections-cards-div">
          <div className="card-wrapper">
            <div className="card-inner-wrapper">
              <div className="vyrl-section-card1" ref={card1Ref}>
                <h1>Think Clearly</h1>
                <p>
                   We define the strategy, audience, goals, and digital
                  direction before any creative or technical work begins.
                </p>
              </div>
              <div className="vyrl-section-card2" ref={card2Ref}>
                <h1>Build Boldly</h1>
                <p>
                   We design, develop, create, and execute every layer with a
                  balance of creativity, usability, and performance
                </p>
              </div>
              <div className="vyrl-section-card3" ref={card3Ref}>
                <h1>Improve Constantly</h1>
                <p>
                   We track, refine, optimize, and evolve the work so your
                  digital ecosystem keeps getting stronger.
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
