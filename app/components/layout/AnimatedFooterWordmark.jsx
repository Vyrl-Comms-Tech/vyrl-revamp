"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// Separate the joined V/Y outline at their shared vertical edge.
const LETTERS = ['M30.6879 9.98283H30.1204C28.15 9.98283 26.3921 11.0073 25.3036 12.7885C25.062 13.1931 24.0143 15.3934 22.9898 17.681C21.9653 19.9802 20.8797 22.23 20.577 22.6869C19.1858 24.8232 17.0117 26.0369 14.5728 26.0369C12.1338 26.0369 10.3002 25.0269 8.93522 23.0915C8.29201 22.1951 7.02597 19.6775 4.39784 14.0924C3.65276 12.5004 2.33724 9.74418 1.50485 7.97462C0.657911 6.21671 -0.0114922 4.7644 0.00014957 4.75276C0.0263436 4.74112 1.54269 4.75276 3.38791 4.77895L6.74948 4.82843L7.93694 7.36925C8.5947 8.77209 9.56679 10.8967 10.1227 12.0696C13.2194 18.7433 13.9266 19.9686 14.6863 19.9686C15.4459 19.9686 15.8359 19.2992 17.847 14.6861C18.5804 12.9922 19.3372 11.3245 19.5147 10.9578C20.7778 8.44321 22.8646 6.49612 25.2774 5.56186C27.0469 4.87791 27.728 4.80224 32.4691 4.80224H30.6879Z', 'M35.3708 28.371L37.0909 27.7133L37.3325 28.1062C38.4064 29.9631 40.2633 30.9613 42.6149 30.9613C45.5865 30.9613 47.7577 29.4334 48.4416 26.8401C48.657 26.0427 48.8578 22.62 48.6949 22.62C48.6454 22.62 48.2146 22.9751 47.7606 23.4175C46.0027 25.0473 44.2215 25.7807 41.7069 25.8826C39.7103 25.9583 38.2813 25.6556 36.5263 24.7708C34.454 23.7347 32.9988 22.3057 32.0151 20.3469C31.0168 18.362 30.6879 16.4673 30.6879 12.675V9.98283V4.80224H36.7533V9.95955C36.7533 15.5069 36.8173 16.1646 37.4372 17.518C37.8156 18.3533 38.8663 19.4127 39.6987 19.8318C41.669 20.7922 44.3379 20.6904 46.1831 19.5786C47.6354 18.7054 48.4329 17.3666 48.6221 15.4457C48.6978 14.7763 48.7094 12.2734 48.6716 9.54335L48.5959 4.80515H54.8272V14.6395C54.8272 24.7243 54.7631 26.0893 54.3091 27.8588C53.1711 32.2827 49.5709 35.5948 45.0335 36.4039C43.9101 36.5931 42.0008 36.6571 40.9269 36.5174C37.2248 36.0634 33.8865 33.9766 32.245 31.0836C31.8201 30.3327 31.6833 29.8175 31.6833 29.8175', 'M57.3505 20.0442C57.3505 13.9265 57.4262 12.9922 58.0723 11.3857C59.0444 8.94671 60.8663 6.97343 63.2296 5.78596C64.746 5.01469 66.9084 4.54611 68.9312 4.54611H69.9935V9.95663L68.6402 10.0061C67.086 10.0701 66.1896 10.3466 65.3048 11.0539C64.5975 11.6098 63.8757 12.7099 63.5236 13.746C63.2587 14.5551 63.2442 14.8084 63.1947 20.1286L63.1569 25.6527H57.3563V20.0413L57.3505 20.0442Z', 'M80.2296 25.7516C79.2808 25.5887 77.9158 25.1987 77.0164 24.7446C74.9937 23.7085 73.5792 21.8254 72.872 19.273C72.5926 18.2747 72.5809 18.1088 72.5431 9.12425L72.5052 0H78.4455L78.4833 8.49269L78.5182 16.1937C78.5182 16.7263 78.6259 17.2531 78.8238 17.745C79.5078 19.4389 81.1755 20.475 83.2215 20.475H83.6377V25.9088L82.0952 25.8972C81.2366 25.8855 80.4042 25.7778 80.2267 25.7546L80.2296 25.7516Z'];

export default function AnimatedFooterWordmark() {
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const letters = svg.querySelectorAll("[data-wordmark-letter]");
      let visible = false;
      let hovering = false;
      let entered = false;
      let loop;
      let settle;
      gsap.set(letters, { y: 44 });
      const intro = gsap.to(letters, {
        y: 0, duration: 1.05, stagger: 0.18, ease: "power3.out", paused: true,
        onComplete: () => { entered = true; syncAnimation(); },
      });
      const stopLoop = () => {
        if (!loop) return;
        loop.kill();
        loop = undefined;
        // Finish the upward roll, then reset to the identical original copy.
        settle = gsap.to(letters, {
          y: -44, duration: 0.45, ease: "power2.out",
          onComplete: () => { gsap.set(letters, { y: 0 }); settle = undefined; syncAnimation(); },
        });
      };
      const syncAnimation = () => {
        if (!visible || document.hidden) {
          intro.pause();
          loop?.pause();
          settle?.pause();
          return;
        }
        if (!entered) { intro.play(); return; }
        if (settle) { settle.play(); return; }
        if (!hovering) { stopLoop(); return; }
        if (loop) { loop.play(); return; }
        gsap.set(letters, { y: 0 });
        loop = gsap.timeline({ repeat: -1, repeatDelay: 0.65 });
        loop.to(letters, { y: -44, duration: 1.05, stagger: 0.22, ease: "power3.inOut" });
      };
      const enter = (event) => {
        if (event.pointerType === "touch") return;
        hovering = true;
        syncAnimation();
      };
      const leave = () => { hovering = false; syncAnimation(); };
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        syncAnimation();
      }, { threshold: 0.5 });
      observer.observe(svg);
      svg.addEventListener("pointerenter", enter);
      svg.addEventListener("pointerleave", leave);
      document.addEventListener("visibilitychange", syncAnimation);
      return () => {
        observer.disconnect();
        svg.removeEventListener("pointerenter", enter);
        svg.removeEventListener("pointerleave", leave);
        document.removeEventListener("visibilitychange", syncAnimation);
        intro.kill();
        loop?.kill();
        settle?.kill();
      };
    });
    return () => media.revert();
  }, []);

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 37" fill="currentColor" role="img" aria-label="Vyrl" style={{ overflow: "hidden" }}>
      {LETTERS.map((path, index) => (
        <g key={index} data-wordmark-letter="" aria-hidden="true">
          <path d={path} />
          <path d={path} transform="translate(0 44)" />
        </g>
      ))}
    </svg>
  );
}
