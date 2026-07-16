"use client";
import React, { useRef } from "react";
import "../../styles/about-hero.css";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import CtaButton from "../layout/cta";

gsap.registerPlugin(ScrollTrigger, Flip);

const AboutHero = ({ mobileWordmark }) => {
  const containerRef = useRef(null);
  const imageWrapRef = useRef(null);
  const placeholderRef = useRef(null);
  const spacerRef = useRef(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const imageWrap = imageWrapRef.current;
      const placeholder = placeholderRef.current;
      const spacer = spacerRef.current;
      if (!container || !imageWrap || !placeholder || !spacer) return;

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

      const tween = gsap.to(imageWrap, {
        ...flip,
        ease: "none",
        paused: true,
      });

      // No pinning — the image simply grows/moves as a normal part of
      // the page's scroll. The animation spans exactly the natural
      // distance between the top row (where the small placeholder
      // sits) and the spacer (where the full-size image settles), so
      // it finishes right as that content scrolls into place — no
      // pin, no leftover blank gap.
      const st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        endTrigger: spacer,
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          tween.progress(self.progress);
        },
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: containerRef, dependencies: [] },
  );

  return (
    <div className="aboutHero" ref={containerRef}>
      <div className="aboutHero-top">
        <div className="aboutHero-imageCol">
          <div className="aboutHero-imagePlaceholder" ref={placeholderRef} />
          <p className="aboutHero-desc">
            We are not here to simply design, post, develop, or advertise. We
            are here to understand what your brand is trying to become — then
            build the digital system that helps it get there.
          </p>
          <CtaButton label="Lets Get In Touch" href="/contact" />
        </div>

        <div className="aboutHero-headingCol">
          <span className="aboutHero-tag">• About</span>
          <h1>
            A Creative Partner
            <br />
            For The Digital Era
          </h1>
        </div>

        {mobileWordmark && (
          <div className="aboutHero-mobileWordmark">{mobileWordmark}</div>
        )}
      </div>

      <div className="aboutHero-imageSpacer" ref={spacerRef} />

      <div className="aboutHero-imageWrap" ref={imageWrapRef}>
        <img src="/img2.png" alt="" />
      </div>
    </div>
  );
};

export default AboutHero;
