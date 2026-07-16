"use client";
import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import TextAnimation from "../home/TextAnimation";

const filters = ["ALL", "NEW", "EDUCATIONAL", "REAL ESTATES"];

const BlogParent = ({ active, setActive }) => {
  const btnRefs = useRef([]);

  // Create one reversed timeline per button — plays on enter, reverses on leave
  useLayoutEffect(() => {
    const cleanups = btnRefs.current.map((btn) => {
      if (!btn) return null;
      const dot = btn.querySelector(".bp-dot");

      // Initial dot state
      gsap.set(dot, { scale: 0.5 });

      const tl = gsap
        .timeline({ paused: true })
        .fromTo(
          btn,
          {
            backgroundColor: "transparent",
            color: "#111",
            borderColor: "#c8c8c8",
          },
          {
            backgroundColor: "#111",
            color: "#fff",
            borderColor: "#111",
            duration: 0.28,
            ease: "power2.out",
          },
          0,
        )
        .fromTo(
          dot,
          { scale: 0.5 },
          { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.75)" },
          0,
        );

      const enter = () => {
        if (!btn.classList.contains("active")) tl.play();
      };
      const leave = () => {
        if (!btn.classList.contains("active")) tl.reverse();
      };

      btn.addEventListener("mouseenter", enter);
      btn.addEventListener("mouseleave", leave);

      return () => {
        btn.removeEventListener("mouseenter", enter);
        btn.removeEventListener("mouseleave", leave);
        tl.kill();
      };
    });

    return () => cleanups.forEach((fn) => fn?.());
  }, []);

  // When active filter changes: clear GSAP inline styles so CSS active class takes over,
  // and snap dots to correct scale (1 for active, 0.5 for the rest)
  useLayoutEffect(() => {
    btnRefs.current.forEach((btn) => {
      if (!btn) return;
      const dot = btn.querySelector(".bp-dot");
      gsap.set(btn, { clearProps: "backgroundColor,color,borderColor" });
      gsap.set(dot, { scale: btn.classList.contains("active") ? 1 : 0.5 });
    });
  }, [active]);

  return (
    <div className="bp-hero">
                        <TextAnimation animateOnScroll={true} delay={0.3}>
      
        <h1>
          <span className="bp-h1-black">What We Do,</span>
          <br />
          <span className="bp-h1-gray">We Do Differently</span>
        </h1>
      </TextAnimation>
                        <TextAnimation animateOnScroll={true} delay={0.3}>
      
        <p>
          Our services are designed to transform ideas into refined digital
          experiences that leave a lasting impression.
        </p>
      </TextAnimation>

      <div className="bp-filters">
        {filters.map((label, i) => (
          <button
            key={label}
            ref={(el) => (btnRefs.current[i] = el)}
            className={`bp-filter-btn${active === label ? " active" : ""}`}
            onClick={() => setActive(label)}
          >
            {label}
            {/* <span className="bp-dot" /> */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlogParent;
