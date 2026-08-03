"use client";
import React, { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextAnimation from "./TextAnimation";
import "../../styles/home-second-last.css";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const HomeSecondLast = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);

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
      { threshold: 0.1 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Rotate + glide-over entrance: the section starts tilted and shifted
  // down, then straightens out and slides up to its resting position as
  // the user scrolls it into view — scrubbed frame-by-frame against
  // scroll position (not a fixed-duration tween) so it tracks the
  // scrollbar directly, and sits above the preceding section (z-index)
  // so it visually glides OVER it rather than just appearing after it.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const refreshRaf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();

        gsap.fromTo(
          section,
          { rotate: 12, y: 420, x: -420, opacity: 0.7 },
          {
            rotate: 0,
            y: 0,

            x: 0,
            opacity: 1,
            duration: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 10%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      return () => cancelAnimationFrame(refreshRaf);
    },
    { scope: sectionRef },
  );

  return (
    <div className="hp-section-parent">
      <section className="hp-section">
        <div className="hp-grid">
          {/* Left dark panel */}
          <div className="hp-left">
            <div className="hp-text-group">
              <TextAnimation animateOnScroll={true} delay={0.3}>
                <h2 className="hp-heading">
                  Your Next Digital Move Starts Here.
                </h2>
              </TextAnimation>
              <TextAnimation animateOnScroll={true} delay={0.3}>
                <p className="hp-para">
                  Whether you need a website, app, campaign, content system,
                  automation setup, or complete digital ecosystem, tell us what
                  you are building, and we will help shape the next move.
                </p>
              </TextAnimation>
            </div>

            <Link href="/contact-us" className="hp-btn">
              Start a Project
              <span className="hp-btn-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="18"
                  viewBox="0 0 15 18"
                  fill="none"
                >
                  <path
                    d="M10.3213 0.000213146L1.27547e-05 4.4884L0.64805 5.937L8.47908 2.53785L2.7051 17.4253L4.19683 18.0038L9.97081 3.11641L13.462 10.9068L14.9174 10.274L10.3213 0.000213146Z"
                    fill="white"
                  />
                </svg>
              </span>
            </Link>
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
    </div>
  );
};

export default HomeSecondLast;
