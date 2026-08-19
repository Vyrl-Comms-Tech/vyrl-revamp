"use client";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import "../../styles/about-hero.css";
import CtaButton from "../layout/cta";
import AboutImg from "./aboutImg";
import VyrlCtaButton from "../layout/VyrlCtaButton";

gsap.registerPlugin(ScrollTrigger, Flip);

const AboutHero = () => {
  const containerRef = useRef(null);
  const topRef = useRef(null);
  const imageWrapRef = useRef(null);
  const placeholderRef = useRef(null);
  const spacerRef = useRef(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const top = topRef.current;
      const imageWrap = imageWrapRef.current;
      const placeholder = placeholderRef.current;
      const spacer = spacerRef.current;
      if (!container || !top || !imageWrap || !placeholder || !spacer) return;

      let tween;
      let navbarTrigger;
      let cancelled = false;

      // Navbar is white/translucent by default (see navbar.css) and this
      // section's own background is white too, so the navbar reads as
      // invisible against it. Darken it to black for as long as
      // AboutHero is the section in view, reverting once it scrolls
      // past — same pattern as HeroModelSection.jsx/Work.jsx/
      // Testimonials.jsx darkening or restoring the navbar to match
      // whatever background is showing at that point in the page, just
      // with toggleActions instead of scrub since there's no gradient to
      // ride here — this section is a flat white the whole time it's on
      // screen, so the navbar only needs an on/off flip at its edges,
      // not a continuous scrub.
      //
      // .nav-bar/.menu-dropdown live in the sibling Navbar.jsx component
      // and aren't guaranteed to have mounted yet at this exact moment —
      // same lazy-lookup-with-poll guard used everywhere else this app
      // reaches across to the navbar.
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
            // onEnter/onEnterBack fire crossing INTO the range going
            // forward/backward respectively; onLeave/onLeaveBack fire
            // crossing OUT of it going forward/backward.
            //
            // No onLeaveBack here on purpose: AboutHero is the very first
            // element on this page, so "leaving backward past start"
            // means scrollY has landed back at/near 0 — i.e. still
            // resting inside (or right at the edge of) this same section,
            // not actually above it into some other content. With
            // onLeaveBack wired to lighten(), scrolling up from below
            // fired onEnterBack (darken) immediately followed by
            // onLeaveBack (lighten) as the scroll settled at the top edge
            // — the navbar ended up stuck whitish at the very moment it
            // should read as "still on AboutHero." onEnterBack handles
            // the real "scrolled back up into this section" case; there's
            // no meaningful state above it on this page to revert for.
            onEnter: darken,
            onEnterBack: darken,
            // Scrolling forward past AboutHero into whatever comes next
            // (currently just whatever that section's own default
            // background is) — lighten back rather than leaving the
            // navbar stuck black with nothing below claiming it. If a
            // later section (e.g. the planned black "logo section")
            // wants the navbar dark again, it can add its own trigger the
            // same way, independent of this one.
            onLeave: darken,
          });

          // This section is at the very top of the page, so it's already
          // "entered" on first load — onEnter alone only fires on the
          // NEXT scroll crossing, which would leave the navbar in its
          // default whitish state until the user scrolled away and back.
          // ScrollTrigger's own .isActive right after .create() isn't
          // reliable this early (its internal position bookkeeping is
          // still catching up to a page whose layout may still be
          // settling — the same class of stale-measurement issue as
          // every other deferred trigger in this app) — so this measures
          // the container's real, current position directly instead of
          // trusting that flag.
          const rect = container.getBoundingClientRect();
          if (rect.top <= 0 && rect.bottom > 0) darken();
          return;
        }
        attempts += 1;
        if (attempts < 30) requestAnimationFrame(addNavbarTrigger);
      };
      addNavbarTrigger();

      // Snap the image to the placeholder's box immediately (synchronously,
      // same frame) so there's no flash of it sitting at its unstyled
      // top:0/left:0 default before the deferred measurement below runs.
      const initialPlaceholderRect = placeholder.getBoundingClientRect();
      const initialContainerRect = container.getBoundingClientRect();
      gsap.set(imageWrap, {
        top: initialPlaceholderRect.top - initialContainerRect.top,
        left: initialPlaceholderRect.left - initialContainerRect.left,
        width: initialPlaceholderRect.width,
        height: initialPlaceholderRect.height,
      });

      // On client-side navigation into this page (e.g. clicking "About"
      // from the navbar), this effect can run before the new route's
      // layout has actually settled — fonts still swapping in, the embed
      // background image not yet loaded, or the page not yet scrolled
      // back to top. Measuring container/placeholder/spacer rects at
      // that moment bakes in wrong values into both the Flip states AND
      // the tween's target ("flip") vars, not just the ScrollTrigger's
      // start/end — a later ScrollTrigger.refresh() (SmoothScroll.jsx
      // runs one on every route change) only fixes the trigger's scroll
      // position, not these already-computed Flip vars, so the image sat
      // wrong/overlapping the description until something else (like the
      // user's own scroll) forced a full re-measure. Waiting for fonts
      // and a couple of paint frames before measuring avoids that stale
      // snapshot in the first place — the cheap snap above keeps the
      // image correctly placed in the meantime.
      const fontsReady =
        typeof document !== "undefined" && document.fonts?.ready
          ? document.fonts.ready
          : Promise.resolve();

      fontsReady.then(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          requestAnimationFrame(() => {
            if (cancelled) return;

            ScrollTrigger.refresh();

            const containerRect = container.getBoundingClientRect();
            const placeholderRect = placeholder.getBoundingClientRect();
            const spacerRect = spacer.getBoundingClientRect();

            // Natural (final) rect — where the image should sit once fully
            // scrolled through, matching the spacer's reserved position/size.
            gsap.set(imageWrap, {
              top: spacerRect.top - containerRect.top,
              left: spacerRect.left - containerRect.left,
              width: spacerRect.width,
              height: spacerRect.height,
            });
            const naturalState = Flip.getState(imageWrap);

            // Small starting rect — snapped onto the placeholder box.
            gsap.set(imageWrap, {
              top: placeholderRect.top - containerRect.top,
              left: placeholderRect.left - containerRect.left,
              width: placeholderRect.width,
              height: placeholderRect.height,
            });

            const flip = Flip.fit(imageWrap, naturalState, {
              getVars: true,
            });

            // No pinning — the image simply grows/moves as a normal part of
            // the page's scroll. Starts once .aboutHero-top's own bottom
            // edge hits the viewport bottom — desktop's existing "wait for
            // the hero text to pass, then grow" trigger point, left as-is
            // since desktop already works correctly.
            //
            // scrub is passed straight to the tween (rather than driving a
            // paused tween's progress from a separate ScrollTrigger onUpdate)
            // so GSAP's own scrub interpolation smooths it — the manual
            // progress() relay added an extra frame of lag on top of Lenis.
            //
            // Mobile gets its own fixed-distance trigger instead of reusing
            // desktop's layout-derived endTrigger/spacer math. On mobile
            // .aboutHero-top is short (auto-height, hugging its stacked
            // text — see about-hero.css's ≤900px block), so the real
            // distance between "top's bottom hits viewport bottom" and the
            // spacer could end up tiny or even already behind the initial
            // scroll position by the time this deferred setup runs — which
            // is what showed as the video already sitting full-size with no
            // visible grow, and nothing left to scrub through afterward.
            // A trigger anchored to the container's own top, scrubbing over
            // a fixed viewport-relative distance, can't collapse like that.
            const isMobile = window.innerWidth <= 900;

            tween = gsap.to(imageWrap, {
              ...flip,
              ease: "none",
              scrollTrigger: isMobile
                ? {
                    // start is offset past "top top" (not at 0) so a
                    // small initial scroll does nothing — the grow only
                    // kicks in once the user has scrolled a bit, then
                    // takes a longer, slower distance (400px) to finish
                    // instead of snapping shut almost immediately.
                    trigger: container,
                    start: "top+=60 top",
                    end: "+=200",
                    scrub: 0.8,
                  }
                : {
                    trigger: top,
                    start: "bottom bottom",
                    endTrigger: spacer,
                    end: "bottom-=30 bottom",
                    scrub: 0.5,
                  },
            });

            ScrollTrigger.refresh();
          });
        });
      });

      return () => {
        cancelled = true;
        tween?.kill();
        navbarTrigger?.kill();
        // Restore the navbar's own default rather than leaving it stuck
        // black if this component unmounts (route change) while it was
        // still in its "AboutHero on screen" black state.
        const navBar = document.querySelector(".nav-bar");
        const menuDropdown = document.querySelector(".menu-dropdown");
        if (navBar || menuDropdown) {
          gsap.set([navBar, menuDropdown].filter(Boolean), {
            clearProps: "backgroundColor",
          });
        }
      };
    },
    { scope: containerRef, dependencies: [] },
  );

  return (
    <div className="aboutHero" ref={containerRef}>
      <div className="aboutHero-top" ref={topRef}>
        <div className="aboutHero-embed">
          <AboutImg />
        </div>

        <div className="aboutHero-bottomRow">
          <div className="aboutHero-imageCol">
            <div className="aboutHero-imagePlaceholder" ref={placeholderRef} />
            <p className="aboutHero-desc">
              We are not here to simply design, post, develop, or advertise. We
              are here to understand what your brand is trying to become  then
              build the digital system that helps it get there.
            </p>
             <VyrlCtaButton label="let's get in touch" href="/contact-us" />
          </div>

          <div className="aboutHero-headingCol">
            <span className="aboutHero-tag">• About</span>
            <h1>
              A Creative Partner
              <br />
              For The Digital Era
            </h1>
          </div>
        </div>
      </div>

      <div className="aboutHero-imageSpacer" ref={spacerRef} />

      <div className="aboutHero-imageWrap" ref={imageWrapRef}>
        {/* <img src="/img2.avif" alt="" /> */}
        <video muted loop autoPlay playsInline>
          <source src="https://res.cloudinary.com/drwzstxy2/video/upload/v1785318296/From_Klickpin.com-_Bookmark_this_guide_to_budget-friendly_playroom_organization_ideas_that_bring_style_function_and_personality_together_with_real_wawftb.mp4" />
        </video>
      </div>
    </div>
  );
};

export default AboutHero;
