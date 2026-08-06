"use client";
import React, { useEffect, useRef } from "react";
// import TextAnimation from "./TextAnimation";
import "../../styles/home-second-last.css";
import "../../styles/services-second-last.css";
import PageTransitionLink from "../layout/PageTransitionLink";
import TextAnimation from "../home/TextAnimation";

const ServicesSecondLast = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

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

          <PageTransitionLink href="/contact-us" className="hp-btn" id="sp-btn">
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
          </PageTransitionLink>
        </div>

        {/* Right image panel */}
        <div className="hp-right">
      <video
        ref={videoRef}
        src="/secondlast_compressed.mp4"
        poster="/secondlast_compressed.jpg"
        loop
        muted
        playsInline
        preload="metadata"
        className="hp-img"
      />

          {/* <img src="/img2.avif" alt="3D digital sculpture" className="hp-img" /> */}
        </div>
      </div>
    </section>
  );
};

export default ServicesSecondLast;
