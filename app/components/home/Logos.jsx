"use client";
import React from "react";
import Image from "next/image";
import TextAnimation from "./TextAnimation";
import "../../styles/logos.css";

// Real client logos in /public — filenames aren't sequential (lo10/lo11
// don't exist, lo12 does), so this is an explicit list rather than a
// numeric range.
const LOGOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12].map((n) => `/lo${n}.avif`);

// Base marquee logo set — duplicated once below so the CSS animation
// (translateX(-50%)) loops seamlessly with no visible seam/jump.
const marqueeLogos = LOGOS;

const Logos = () => {
  return (
    <div className="logos-container">
      <div className="logos-left">
        <TextAnimation animateOnScroll={true} delay={0.3}>
          <h2>Our Clients</h2>
        </TextAnimation>
        <TextAnimation animateOnScroll={true} delay={0.3}>
          <p className="logos-left-desc">
            We partner with high growth brands, premium businesses, and forward
            thinking teams across the world, building digital ecosystems
            designed for visibility, trust, and scale.
          </p>
        </TextAnimation>
      </div>
      {/* Simplified logo strip that marquees on all screen sizes — two rows
          scrolling in opposite directions. Each row's set is duplicated so
          translateX(-50%) loops seamlessly. */}
      <div className="logos-marquee" aria-hidden="true">
        <div className="logos-marquee-track logos-marquee-track-left">
          {[...marqueeLogos, ...marqueeLogos].map((logo, i) => (
            <div className="logos-marquee-item" key={i}>
              <Image
                src={logo}
                alt=""
                fill
                sizes="120px"
                style={{ objectFit: "contain" }}
              />
            </div>
          ))}
        </div>
        <div className="logos-marquee-track logos-marquee-track-right">
          {[...marqueeLogos, ...marqueeLogos].map((logo, i) => (
            <div className="logos-marquee-item" key={i}>
              <Image
                src={logo}
                alt=""
                fill
                sizes="120px"
                style={{ objectFit: "contain" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Logos;
