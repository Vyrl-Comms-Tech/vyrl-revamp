'use client'
import React from "react";
import TextAnimation from "../home/TextAnimation";
import "../../styles/text-and-cards.css";
import CtaButton from "../layout/cta";

const AboutText = ({
  children,
  showButton = true,
  buttonLabel = "About us",
  buttonHref = "/about",
  buttonVideoSrc = "/bg-v.mp4",
}) => {
  return (
    <div>
      <section className="hs-text-section">
        <div className="hs-text-inner">
              <TextAnimation animateOnScroll={true} delay={0.3}>
            <h1 className="hs-heading">
              <span className="hs-heading-indent" aria-hidden="true" />
              {children ?? (
                <>
                                                      Our team brings together creative direction, strategic thinking, technical development, content, media, and automation to create work that is not only visually strong, but commercially meaningful. 
                </>
              )}
            </h1>
          </TextAnimation>

          {showButton && (
            <CtaButton
              label={buttonLabel}
              videoSrc={buttonVideoSrc}
              href={buttonHref}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutText;
