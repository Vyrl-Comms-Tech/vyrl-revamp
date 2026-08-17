import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import "../../styles/vyrl-cta-button.css";

gsap.registerPlugin(SplitText);

export default function VyrlCtaButton({
  label = "Contact us",
  onClick,
  className = "",
  type = "button",
}) {
  const rootRef = useRef(null);
  const primaryCharsRef = useRef([]);
  const secondaryCharsRef = useRef([]);

  // Split into chars once per label change.
  const chars = useMemo(() => [...label], [label]);

  // Was resetting these arrays directly during render ("Cannot access
  // refs during render" — refs are a commit/effect-time concern, not a
  // render one). Rebuilt instead inside useLayoutEffect, which runs
  // after the char <span> callback refs for *this* render have already
  // fired and populated the arrays — clearing them first thing here,
  // synchronously before GSAP reads them, gives the same "fresh array
  // per label change" guarantee without touching ref.current at render
  // time.
  useLayoutEffect(() => {
    const root = rootRef.current;
    primaryCharsRef.current = primaryCharsRef.current.slice(0, chars.length);
    secondaryCharsRef.current = secondaryCharsRef.current.slice(
      0,
      chars.length,
    );
    const primaryChars = primaryCharsRef.current;
    const secondaryChars = secondaryCharsRef.current;
    if (!root || !primaryChars.length || !secondaryChars.length) return;
 
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
 
    // Reduced motion: skip the JS char animation, CSS handles a static
    // opacity swap instead (see VyrlCtaButton.css).
    if (prefersReducedMotion) return;
 
    const ctx = gsap.context(() => {
      gsap.set(primaryChars, { yPercent: 0, rotateX: 0 });
      gsap.set(secondaryChars, { yPercent: 25, rotateX: 100 });
 
      const enterTl = gsap.timeline({ paused: true });
      enterTl
        .to(
          primaryChars,
          {
            yPercent: -120,
            rotateX: 100,
            duration: 0.4,
            stagger: 0.01,
            ease: "power3.inOut",
          },
          0
        )
        .to(
          secondaryChars,
          {
            yPercent: -20,
            rotateX: 0,
            duration: 0.4,
            stagger: 0.01,
            ease: "power3.out",
          },
          0
        );
 
      const handleEnter = () => enterTl.timeScale(1).play();
      const handleLeave = () => enterTl.timeScale(1.4).reverse();
 
      root.addEventListener("mouseenter", handleEnter);
      root.addEventListener("mouseleave", handleLeave);
      root.addEventListener("focus", handleEnter);
      root.addEventListener("blur", handleLeave);
 
      return () => {
        root.removeEventListener("mouseenter", handleEnter);
        root.removeEventListener("mouseleave", handleLeave);
        root.removeEventListener("focus", handleEnter);
        root.removeEventListener("blur", handleLeave);
      };
    }, root);
 
    return () => ctx.revert();
  }, [chars]);
 
  return (
    <button
      ref={rootRef}
      type={type}
      onClick={onClick}
      className={`vyrl-cta ${className}`.trim()}
    >
      <span className="vyrl-cta__blob" aria-hidden="true" />
      <span className="vyrl-cta__text-wrap">
        <span className="vyrl-cta__text vyrl-cta__text--primary" aria-hidden="true">
          {chars.map((char, i) => (
            <span
              key={`p-${i}`}
              ref={(el) => el && (primaryCharsRef.current[i] = el)}
              className="vyrl-cta__char"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        <span className="vyrl-cta__text vyrl-cta__text--secondary" aria-hidden="true">
          {chars.map((char, i) => (
            <span
              key={`s-${i}`}
              ref={(el) => el && (secondaryCharsRef.current[i] = el)}
              className="vyrl-cta__char"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        {/* Real accessible name lives here, hidden visually, always intact
            for screen readers regardless of char-split/animation state. */}
        <span className="vyrl-cta__sr-only">{label}</span>
      </span>
    </button>
  );
}
 