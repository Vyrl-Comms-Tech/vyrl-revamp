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
          <span className="slider-tag">• Digital Campaign</span>
          <h1>
            What We Do,
            <br />
            <span className="slider-heading-muted">We Do Differently</span>
          </h1>
        </div>

        <div className="slider-textCol">
          <p className="slider-desc">
            Our services are designed to transform ideas into refined digital
            experiences that leave a lasting impression.
          </p>
          <CtaButton label="Lets Get In Touch" href="/contact" />
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
