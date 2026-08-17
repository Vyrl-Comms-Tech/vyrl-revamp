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
      let cancelled = false;

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
                    trigger: container,
                    start: "top top",
                    end: `+=${window.innerHeight * 0.2}`,
                    scrub: 0.5,
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
