"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import TextAnimation from "./components/home/TextAnimation";
import CtaButton from "./components/layout/cta";
import "./styles/not-found.css";

const NotFound = () => {
  const sectionRef = useRef(null);
  const digitsRef = useRef([]);
  const quickToX = useRef(null);
  const quickToY = useRef(null);

  useEffect(() => {
    const digits = digitsRef.current;
    if (!digits.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        digits,
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.08,
          ease: "power4.out",
          delay: 0.15,
        },
      );

      // Slow, idle drift — same restrained feel as the preloader's
      // flying letters, just continuous instead of a one-shot intro.
      gsap.to(digits, {
        y: "+=14",
        duration: 2.6,
        ease: "sine.inOut",
        stagger: { each: 0.15, yoyo: true, repeat: -1 },
        repeat: -1,
        yoyo: true,
        delay: 1.4,
      });

      // Cursor-following glow (see .notfound-glow) — a cheap CSS radial
      // gradient positioned via quickTo instead of a WebGL shader, same
      // reasoning as the preloader's own CSS-only reveal: the visual
      // payoff here doesn't justify a render loop/GPU context.
      quickToX.current = gsap.quickTo(".notfound-glow", "--x", {
        duration: 0.6,
        ease: "power3.out",
      });
      quickToY.current = gsap.quickTo(".notfound-glow", "--y", {
        duration: 0.6,
        ease: "power3.out",
      });

      // Subtle parallax tilt on the digits toward the cursor.
      const onMove = (e) => {
        const rect = sectionRef.current.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        quickToX.current?.(e.clientX - rect.left);
        quickToY.current?.(e.clientY - rect.top);

        gsap.to(digits, {
          x: px * 18,
          y: py * 12,
          duration: 0.6,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      sectionRef.current.addEventListener("mousemove", onMove);
      return () => sectionRef.current?.removeEventListener("mousemove", onMove);
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="notfound" ref={sectionRef}>
      <div className="notfound-glow" aria-hidden="true" />
      <div className="notfound-grid" aria-hidden="true" />

      <div className="notfound-inner">
        <span className="notfound-eyebrow">you lost !!!</span>

        <div className="notfound-digits" aria-hidden="true">
          {["4", "0", "4"].map((d, i) => (
            <span
              className="notfound-digit"
              key={i}
              ref={(el) => {
                digitsRef.current[i] = el;
              }}
            >
              {d}
            </span>
          ))}
        </div>

        <TextAnimation animateOnScroll={false} delay={0.7}>
          <h1 className="notfound-heading">This page moved on</h1>
        </TextAnimation>

        <TextAnimation animateOnScroll={false} delay={0.85}>
          <p className="notfound-desc">
            The page you&apos;re looking for doesn&apos;t exist, was
            renamed, or never made it to launch. Let&apos;s get you back
            to somewhere real.
          </p>
        </TextAnimation>

        <div className="notfound-cta">
          <CtaButton
            label="Back To Home"
            href="/"
            className="cta-button-white"
          />
          <CtaButton
            label="See Our Work"
            href="/projects"
            className="notfound-cta-secondary"
          />
        </div>
      </div>
    </section>
  );
};

export default NotFound;
