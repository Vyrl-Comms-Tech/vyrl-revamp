'use client'
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import VyrlCtaButton from "../layout/VyrlCtaButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaButton from "../layout/cta";
import "../../styles/slider.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const images = [
  "1 (1) (2).avif",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "1 (1) (2).avif",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "1 (1) (2).avif",
  "4.png",
];

const Slider = () => {
  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");

    const handleScreenChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  // Navbar is white/translucent by default (see navbar.css) and this
  // section's own background is white too (.banner/.slider — see
  // slider.css), so the navbar reads as invisible against it. Darken
  // it to black for as long as this section is in view, restoring it
  // once scrolled past — same onEnter/onEnterBack/onLeave/onLeaveBack
  // ScrollTrigger pattern HeroModelSection.jsx, Work.jsx, and
  // AboutHero.jsx all use for this exact thing (a flat-color section
  // where the navbar only needs an on/off flip at its edges, not a
  // continuous scrub). Unlike AboutHero.jsx's version, onLeave restores
  // (lighten) rather than re-darkening — Services3d, which follows this
  // section on /services (see services/page.jsx), has no navbar logic
  // of its own to hand off to, so this needs to put the navbar back to
  // its default state on the way out rather than assuming something
  // else downstream will.
  //
  // .nav-bar/.menu-dropdown live in the sibling Navbar.jsx component
  // and aren't guaranteed to have mounted yet at this exact moment —
  // same lazy-lookup-with-poll guard used everywhere else this app
  // reaches across to the navbar.
  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    let navbarTrigger;
    let cancelled = false;
    let attempts = 0;

    const addNavbarTrigger = () => {
      if (cancelled) return;
      const navBar = document.querySelector(".nav-bar");
      const menuDropdown = document.querySelector(".menu-dropdown");
      if (navBar && menuDropdown) {
        const darken = () =>
          gsap.to([navBar, menuDropdown], {
            backgroundColor: "#0a0a0a",
            ease: "power2.inOut",
            duration: 0.6,
          });
        const lighten = () =>
          gsap.to([navBar, menuDropdown], {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            ease: "power2.inOut",
            duration: 0.6,
          });

        navbarTrigger = ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "bottom top",
          // No onLeaveBack: Slider is the very first section on
          // /services (see services/page.jsx), so "leaving backward
          // past start" just means scrollY settled back at/near 0 —
          // still resting inside this same section, not actually above
          // it into something else. Wiring onLeaveBack to lighten() here
          // fired it right as the scroll-up landed at the top edge,
          // leaving the navbar stuck light while Slider's white
          // background was still the one on screen — same edge case
          // AboutHero.jsx documents and avoids the same way for the
          // same reason (its own first-section-on-the-page position).
          onEnter: darken,
          onEnterBack: darken,
          onLeave: lighten,
        });

        // If this section is already in view at mount (e.g. a direct
        // link straight to /services), onEnter alone only fires on the
        // NEXT scroll crossing — measure the real, current position
        // directly instead of trusting ScrollTrigger's own .isActive
        // this early, same reasoning as AboutHero.jsx's identical
        // guard.
        const rect = container.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) darken();
        return;
      }
      attempts += 1;
      if (attempts < 30) requestAnimationFrame(addNavbarTrigger);
    };
    addNavbarTrigger();

    return () => {
      cancelled = true;
      navbarTrigger?.kill();
    };
  }, []);

  // Flip the page's own background (document.body, not just this
  // section) from white to black as this section scrolls through its
  // second half, so the black that Services3d opens with (see
  // services/page.jsx — it's rendered with `dark`) is already in place
  // by the time it arrives instead of cutting in abruptly. Same
  // gsap.to(document.body, { background }) + scrubbed ScrollTrigger
  // idiom Work.jsx uses for its own body-background swap. Scrubbed
  // against the section's own height (start "top top", end "bottom
  // top") so "halfway" means halfway through this section's scroll
  // distance, not the viewport.
  //
  // The heading/description/tag text (.slider-tag, h1, .slider-desc)
  // are set for a white background (#000/#011825 — see slider.css) and
  // would disappear into the incoming black, so they crossfade to white
  // in the same scrub, on the same timeline, so both changes track
  // together.
  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const headingCol = container.querySelector(".slider-headingCol");
    const textCol = container.querySelector(".slider-textCol");

    // Trigger spans the section's full scroll distance, and the intent
    // is for the color tweens to only run across the first half of that
    // — black fully reached once the section has scrolled halfway
    // through, then holding black for the remaining half. Giving each
    // tween duration: 0.5 alone doesn't do that: with no other content
    // after them, GSAP auto-sizes the timeline's own total length to fit
    // its longest child, so the timeline itself becomes exactly 0.5
    // long and the scrub maps that whole 0.5 across the *entire*
    // trigger range — i.e. still a plain fade end-to-end, just measured
    // in different units. The dummy tween appended at position 0.5
    // (doing nothing, but 0.5 long) stretches the timeline's total
    // length to 1, so the real color tweens above now occupy only the
    // first half of the scrub range and hold at their end value — black
    // — for the second half.
    const bodyTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "center top-=20",
        end: "bottom top",
        // duration
        scrub: true,
      },
    });

    // bodyTl.to(
    //   container,
    //   { backgroundColor: "#000000", duration: 0.5, ease: "none" },
    //   0,
    // );
    bodyTl.to(
      document.body,
      { background: "#000000", duration: 0.5, ease: "none" },
      0,
    );
    if (headingCol) {
      bodyTl.to(
        headingCol.querySelectorAll(".slider-tag, h1"),
        { color: "#ffffff", duration: 0.5, ease: "none" },
        0,
      );
    }
    if (textCol) {
      bodyTl.to(
        textCol.querySelectorAll(".slider-desc"),
        { color: "#ffffff", duration: 0.5, ease: "none" },
        0,
      );
    }
    bodyTl.to({}, { duration: 0.5 }, 0.5);

    return () => {
      bodyTl.scrollTrigger?.kill();
      bodyTl.kill();
      // Same cleanup Work.jsx/Testimonials.jsx/AboutPartnerSection.jsx use
      // for their own document.body tweens: strip the inline background
      // this timeline set so it doesn't leak black into whatever route
      // gets navigated to next (their bodies don't expect it).
      gsap.set(document.body, { clearProps: "background" });
    };
  }, []);

  // Show 10 images at 760px and below, otherwise show all 14.
  const visibleImages = isMobile ? images.slice(0, 10) : images;

  return (
    <div className="banner text" ref={rootRef}>
      <div className="slider-top">
        <div className="slider-headingCol">
          <span className="slider-tag">• Services</span>

          <h1>
            Digital Systems
            <br />
            <span className="slider-heading-muted">Built To Move</span>
          </h1>
        </div>

        <div className="slider-textCol">
          <p className="slider-desc">
            Tech, strategy, content, campaigns, and performance connected
            under one roof to help ambitious brands show up stronger and scale
            smarter.
          </p>

          <VyrlCtaButton label="Lets Get In Touch" href="/contact-us" className="vyrl-cta--solid" />
        </div>
      </div>

      <div
        className="slider"
        style={{ "--quantity": visibleImages.length }}
      >
        {visibleImages.map((image, index) => (
          <div
            className="item"
            key={`${image}-${index}`}
            style={{ "--position": index + 1 }}
          >
            <Image
              src={`/${image}`}
              alt={`Service ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 760px) 40vw, 20vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;