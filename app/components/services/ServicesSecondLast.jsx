"use client";
import React from "react";
// import TextAnimation from "./TextAnimation";
import "../../styles/home-second-last.css";
import "../../styles/services-second-last.css";
import Link from "next/link";
import TextAnimation from "../home/TextAnimation";

const ServicesSecondLast = () => {
  return (
    <section className="hp-section" id="services-second-last">
      <div className="hp-grid">
        {/* Left dark panel */}
        <div className="hp-left" id="sp-left">
          <div className="hp-text-group">
            <TextAnimation animateOnScroll={true} delay={0.3}>
              <h2 className="hp-heading" id="sp-heading">
                Your Next Digital Move Starts Here.
              </h2>
            </TextAnimation>
            <TextAnimation animateOnScroll={true} delay={0.3}>
              <p className="hp-para" id="sp-para">
                Whether you need a website, app, campaign, content system,
                automation setup, or complete digital ecosystem, tell us what
                you are building, and we will help shape the next move.
              </p>
            </TextAnimation>
          </div>

          <Link href="/contact-us" className="hp-btn" id="sp-btn">
            Start a Project
            <span className="hp-btn-icon" id="sp-btn-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="18"
                viewBox="0 0 15 18"
                fill="none"
              >
                <path
                  d="M10.3213 0.000213146L1.27547e-05 4.4884L0.64805 5.937L8.47908 2.53785L2.7051 17.4253L4.19683 18.0038L9.97081 3.11641L13.462 10.9068L14.9174 10.274L10.3213 0.000213146Z"
                  fill="black"
                />
              </svg>
            </span>
          </Link>
        </div>

        {/* Right image panel */}
        <div className="hp-right">
          <img src="/img2.avif" alt="3D digital sculpture" className="hp-img" />
        </div>
      </div>
    </section>
  );
};

export default ServicesSecondLast;
