"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "../../styles/cta.css";

const CtaButton = ({
  label = "SERVICES",
  videoSrc = "/bg-v-compressed.mp4",
  href = "#",
  className = "",
  id,
}) => {
  const containerRef = useRef(null);
  const btnRef = useRef(null);
  const arrowBoxRef = useRef(null);
  const textRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    const btn = btnRef.current;
    const arrowBox = arrowBoxRef.current;
    const text = textRef.current;
    if (!btn || !arrowBox || !text) return;

    const handleEnter = () => {
      const btnRect = btn.getBoundingClientRect();
      const arrowRect = arrowBox.getBoundingClientRect();
      const paddingRight = parseFloat(getComputedStyle(btn).paddingRight) || 0;

      const rotateRad = (70 * Math.PI) / 180;
      const rotatedWidth =
        Math.abs(arrowRect.width * Math.cos(rotateRad)) +
        Math.abs(arrowRect.height * Math.sin(rotateRad));
      const rotationGrowth = (rotatedWidth - arrowRect.width) / 2;

      const travel =
        btnRect.right - paddingRight * 0.3 - arrowRect.right - rotationGrowth;

      gsap.to(arrowBox, {
        x: travel,
        rotate: 70,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.to(text, {
        x: -arrowRect.width * 1.3,
        duration: 0.5,
        ease: "power3.out",
      });
    };

    const handleLeave = () => {
      gsap.to(arrowBox, {
        x: 0,
        rotate: 0,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.to(text, {
        x: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    };

    btn.addEventListener("mouseenter", handleEnter);
    btn.addEventListener("mouseleave", handleLeave);

    return () => {
      btn.removeEventListener("mouseenter", handleEnter);
      btn.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div className="cta-btn-container" ref={containerRef}>
      <a
        className={`cta-btn ${className}`.trim()}
        href={href}
        id={id}
        ref={btnRef}
      >
        <div className="cta-btn-vid">
          {shouldLoad && (
            <video muted loop autoPlay playsInline preload="none">
              <source src={videoSrc} />
            </video>
          )}
        </div>
        <div className="cta-arrow-box" ref={arrowBoxRef}>
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
        </div>
        <p ref={textRef}>{label}</p>
      </a>
    </div>
  );
};

export default CtaButton;
