"use client";
import Image from "next/image";
// import TextAnimation from "./TextAnimation";
import "../../styles/logos.css";
import TextAnimation from "../home/TextAnimation";
import CtaButton from "../layout/cta";
const blankPositions = [3, 0, 3];

// Real client logos in /public — filenames aren't sequential (lo10/lo11
// don't exist, lo12 does), so this is an explicit list rather than a
// numeric range.
const LOGOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12].map((n) => `/lo${n}.avif`);

// Base marquee logo set — duplicated once below so the CSS animation
// (translateX(-50%)) loops seamlessly with no visible seam/jump.
const marqueeLogos = LOGOS;

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
    <div className="logos-container" >
      <div className="logos-left" id="about-logos-left">
        <TextAnimation animateOnScroll={true} delay={0.3}>
          <h2>Trusted By Brands With Bigger Ambitions</h2>
        </TextAnimation>
        <div className="logos-left-textcol">
          <TextAnimation animateOnScroll={true} delay={0.3}>
            <p className="logos-left-desc">
              We work with businesses that want more than surface-level digital
              presence. From emerging brands to established companies, our
              clients come to Vyrl for sharper ideas, stronger execution, and
              digital systems built to support real growth.
            </p>
          </TextAnimation>
          <CtaButton
            label="See Our Work"
            href="/projects"
            className="cta-button-white cta-about-logos"
          />
          {/* <button>See Our Work</button> */}
        </div>
      </div>
      <div className="logos-right">
        {(() => {
          // Only non-blank slots consume a logo, so the counter advances
          // once per real logo box rather than once per grid cell — 9
          // slots total across the 3 rows (blankPositions), pulled from
          // the 10 available in LOGOS.
          let logoIndex = 0;
          return blankPositions.map((blankIndex, rowIdx) => (
            <div className="logos-row" key={rowIdx}>
              {Array.from({ length: 4 }).map((_, colIdx) => {
                if (colIdx === blankIndex) {
                  return <div className="logo-box logo-blank" key={colIdx} />;
                }
                const src = LOGOS[logoIndex % LOGOS.length];
                logoIndex += 1;
                return (
                  <div
                    className="logo-box logo-cursor-tracking"
                    key={colIdx}
                    onMouseMove={handleLogoMouseMove}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 1780px) 141px, 196px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                );
              })}
            </div>
          ));
        })()}
      </div>

      {/* Mobile-only: simplified logo strip that marquees, replacing the
          hover-glow grid which doesn't translate well to touch. The set
          is duplicated so translateX(-50%) loops seamlessly. */}
      <div className="logos-marquee" aria-hidden="true">
        <div className="logos-marquee-track">
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
export default AboutLogos;
