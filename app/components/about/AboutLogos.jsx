"use client";
import Image from "next/image";
// import TextAnimation from "./TextAnimation";
import "../../styles/logos.css";
import TextAnimation from "../home/TextAnimation";
import CtaButton from "../layout/cta";

// Real client logos in /public — filenames aren't sequential (lo10/lo11
// don't exist, lo12 does), so this is an explicit list rather than a
// numeric range.
const LOGOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12].map((n) => `/lo${n}.avif`);

// Base marquee logo set — duplicated once below so the CSS animation
// (translateX(-50%)) loops seamlessly with no visible seam/jump.
const marqueeLogos = LOGOS;

const AboutLogos = () => {
  return (
    <div className="logos-container about-logos-container">
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
        </div>
      </div>

      {/* Simplified logo strip that marquees on all screen sizes — two rows
          scrolling in opposite directions. Each row's set is duplicated so
          translateX(-50%) loops seamlessly. */}
      <div className="logos-marquee" aria-hidden="true">
        {/* --logos-marquee-count drives the loop-stride math in logos.css
            (translateX has to shift by exactly one set's width, not 50% of
            the doubled track — see the comment there) — set inline from the
            real logo count so the two can never drift out of sync if this
            list is ever resized. */}
        <div
          className="logos-marquee-track logos-marquee-track-left"
          style={{ "--logos-marquee-count": marqueeLogos.length }}
        >
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
        <div
          className="logos-marquee-track logos-marquee-track-right"
          style={{ "--logos-marquee-count": marqueeLogos.length }}
        >
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
