
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "../../styles/preloader.css";

interface Preloader1Props {
  onComplete?: () => void;
  progress?: number;
}

export default function Preloader1({ onComplete, progress = 100 }: Preloader1Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animationCompleteRef = useRef(false);
  const completionFiredRef = useRef(false);

  const [isExiting, setIsExiting] = useState(false);

  const finishWhenReady = () => {
    if (
      animationCompleteRef.current &&
      progress >= 100 &&
      !completionFiredRef.current
    ) {
      completionFiredRef.current = true;
      onComplete?.();
    }
  };

  useEffect(() => {
    finishWhenReady();
  }, [progress, onComplete]);

  useEffect(() => {
    const path = pathRef.current;

    if (!path) return;

    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        animationCompleteRef.current = true;
        finishWhenReady();
      },
    });

    // V drawing
    tl.to(path, {
      strokeDashoffset: 0,

      duration: 1.8,

      ease: "power3.inOut",
    })

      // V filling
      .to(path, {
        fill: "#000",

        duration: 1,

        ease: "power2.out",
      })

      // remove outline
      .to(path, {
        strokeOpacity: 0,

        duration: 0.5,
      })

      // Reveal YRL
      .to(
        ".hide",

        {
          y: 0,

          opacity: 1,

          duration: 1,

          stagger: 0.15,

          ease: "power3.out",
        },

        "-=.2",
      )

      // Small logo breathing
      .to(
        ".svg-fill-path",

        {
          scale: 1.05,

          duration: 0.5,

          ease: "power2.out",
        },
      )

      .to(
        ".svg-fill-path",

        {
          scale: 1,

          duration: 0.5,

          ease: "power2.inOut",
        },
      )

      // Fade exit
      .to(
        ".hide",

        {
          y: -30,

          opacity: 0,

          duration: 0.6,

          stagger: 0.05,

          ease: "power2.in",
        },
      )

      .to(
        containerRef.current,

        {
          opacity: 0,

          duration: 0.8,

          ease: "power2.inOut",

          onStart: () => {
            setIsExiting(true);
          },
        },
      );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className={`pre-loader ${isExiting ? "pre-loader--exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Page loading"
    >
      <div className="svg-fill-path">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="652"
          height="279"
          viewBox="0 0 652 279"
          fill="black"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            className="first-path"
            d="M231.695 74.2661L239 74.2661V34.4153C202.53 34.4153 208.053 34.9974 194.441 40.2586C175.882 47.4452 159.83 62.4228 150.113 81.7661C148.747 84.5869 142.927 97.4153 137.285 110.445C121.815 145.93 118.815 151.079 112.971 151.079C107.128 151.079 101.688 141.654 77.8668 90.3183C73.5907 81.2959 66.1131 64.9526 61.0534 54.1616L51.9191 34.6168L26.0609 34.2362C11.8668 34.0347 0.202643 33.9452 0.00115054 34.0347C-0.0884017 34.1243 5.06085 45.2959 11.5758 58.8183C17.9788 72.4302 28.0982 93.6317 33.8295 105.878C54.0459 148.841 63.7847 168.206 68.7325 175.102C79.2325 189.99 93.337 197.759 112.098 197.759C130.859 197.759 147.583 188.423 158.285 171.99C160.613 168.475 168.964 151.169 176.844 133.482C184.725 115.885 192.785 98.9601 194.643 95.8481C203.016 82.1467 216.538 74.2661 231.695 74.2661Z"
            fill="black"
          />
        </svg>
      </div>
    </div>
  );
}
