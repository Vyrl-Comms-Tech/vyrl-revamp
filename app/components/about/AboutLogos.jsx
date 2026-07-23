"use client";
import React from "react";
import Image from "next/image";
// import TextAnimation from "./TextAnimation";
import "../../styles/logos.css";
import TextAnimation from "../home/TextAnimation";
import CtaButton from "../layout/cta";

const blankPositions = [3, 0, 3];

// Base marquee logo set — duplicated once below so the CSS animation
// (translateX(-50%)) loops seamlessly with no visible seam/jump.
const marqueeLogos = [1, 2, 3, 4];

const handleLogoMouseMove = (e) => {
  const box = e.currentTarget;
  const rect = box.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  box.style.setProperty("--x", `${x}px`);
  box.style.setProperty("--y", `${y}px`);
};

const AboutLogos = () => {
  return (
    <div className="logos-container">
      <div className="logos-left" id="about-logos-left">
        <TextAnimation animateOnScroll={true} delay={0.3}>
          <h2>Trusted By Brands With Bigger Ambitions</h2>
        </TextAnimation>
        <div className="logos-left-textcol">

        <TextAnimation animateOnScroll={true} delay={0.3}>
          <p className="logos-left-desc">
           We work with businesses that want more than surface-level digital presence. From emerging brands to established companies, our clients come to Vyrl for sharper ideas, stronger execution, and digital systems built to support real growth.
          </p>
        </TextAnimation>
          <CtaButton
            label='See Our Work'
            href='/projects'
            className="cta-button-white cta-about-logos"
          />
        {/* <button>See Our Work</button> */}
        </div>
      </div>
      <div className="logos-right">
        {blankPositions.map((blankIndex, rowIdx) => (
          <div className="logos-row" key={rowIdx}>
            {Array.from({ length: 4 }).map((_, colIdx) =>
              colIdx === blankIndex ? (
                <div className="logo-box logo-blank" key={colIdx} />
              ) : (
                <div
                  className="logo-box logo-cursor-tracking"
                  key={colIdx}
                  onMouseMove={handleLogoMouseMove}
                >
                  {/* logo */}
                  <Image
                    src="/img16.png"
                    alt=""
                    fill
                    sizes="(max-width: 1780px) 141px, 196px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ),
            )}
          </div>
        ))}
      </div>

      {/* Mobile-only: simplified logo strip that marquees, replacing the
          hover-glow grid which doesn't translate well to touch. The set
          is duplicated so translateX(-50%) loops seamlessly. */}
      <div className="logos-marquee" aria-hidden="true">
        <div className="logos-marquee-track">
          {[...marqueeLogos, ...marqueeLogos].map((logo, i) => (
            <div className="logos-marquee-item" key={i}>
              logo
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutLogos;
