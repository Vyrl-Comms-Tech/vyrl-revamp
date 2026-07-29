'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CtaButton from "../layout/cta";
import "../../styles/slider.css";

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

  // Show 10 images at 760px and below, otherwise show all 14.
  const visibleImages = isMobile ? images.slice(0, 10) : images;

  return (
    <div className="banner text">
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
            Tech, strategy, content, campaigns, and performance — connected
            under one roof to help ambitious brands show up stronger and scale
            smarter.
          </p>

          <CtaButton label="Lets Get In Touch" href="/contact-us" />
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