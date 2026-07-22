import React from "react";
import CtaButton from "../layout/cta";
import "../../styles/slider.css";

const images = [
  "cr1.avif",
  "cr2.avif",
  "cr1.avif",
  "cr1.avif",
  "cr2.avif",
  "cr1.avif",
  "cr2.avif",
  "cr1.avif",
  "cr2.avif",
  "cr1.avif",
  "cr2.avif",
  "cr1.avif",
  "cr1.avif",
  "cr2.avif",
];

const Slider = () => {
  return (
    <div className="banner text">
      <div className="slider-top">
        <div className="slider-headingCol">
          <span className="slider-tag">• Services </span>
          <h1>
Digital Systems
            <br />
            <span className="slider-heading-muted">Built To Move</span>
          </h1>
        </div>

        <div className="slider-textCol">
          <p className="slider-desc">
           Tech, strategy, content, campaigns, and performance — connected under one roof to help ambitious brands show up stronger and scale smarter.
          </p>
          <CtaButton label="Lets Get In Touch" href="/contact-us" />
        </div>
      </div>

      <div className="slider" style={{ "--quantity": images.length }}>
        {images.map((image, index) => (
          <div
            className="item"
            key={index}
            style={{ "--position": index + 1 }}
          >
            <img src={`${image}`} alt={`Dragon ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
