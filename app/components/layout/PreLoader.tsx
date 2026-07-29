"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Preloader.module.css";

export interface PreloaderLetter {
  src: string;
  alt?: string;
}

export interface PreloaderProps {
  /** Images that fly up-and-away during the intro (defaults spell "LOADING"). */
  letters?: PreloaderLetter[];
  /** Label rendered above the counter. */
  label?: string;
  /** Looping ambient track started once the reveal completes. */
  ambientSoundSrc?: string;
  /** Called once the reveal transition has fully finished. */
  onFinish?: () => void;
}

const DEFAULT_LETTERS: PreloaderLetter[] = [
  { src: "/loader/l.avif" },
  { src: "/loader/o.avif" },
  { src: "/loader/a.avif" },
  { src: "/loader/d.avif" },
  { src: "/loader/i.avif" },
  { src: "/loader/n.avif" },
  { src: "/loader/g.avif" },
];

export default function Preloader({
  letters = DEFAULT_LETTERS,
  label = "Loading Experience",
  ambientSoundSrc,
  onFinish,
}: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const alphaRefs = useRef<Array<HTMLDivElement | null>>([]);

  const isMountedRef = useRef(true);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isInert, setIsInert] = useState(false);

  // ---------------------------------------------------------------------
  // Reveal: once the intro (counter/letters) finishes, expand a circular
  // clip-path on revealRef from a point at the center out past the
  // corners — pure CSS/compositor-driven. No WebGL/Three.js here at all
  // anymore: the previous shader-based dissolve kept a live WebGL
  // context and render loop running the whole time the preloader was
  // mounted (even with the shader material itself removed), which was
  // real, measurable lag for no visible benefit — plus the WebGL-context
  // failures that plagued some browsers/environments.
  // ---------------------------------------------------------------------
  const finishReveal = () => {
    if (!isMountedRef.current) return;
    setIsInert(true);

    if (ambientSoundSrc) {
      const ambient = new Audio(ambientSoundSrc);
      ambient.loop = true;
      ambient.volume = 0.6;
      ambient.currentTime = 0;
      ambient.play().catch(() => {});
    }

    // Fades .root out before calling onFinish, which unmounts the whole
    // Preloader in PreloaderGate.tsx.
    if (rootRef.current) {
      gsap.to(rootRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => onFinish?.(),
      });
    } else {
      onFinish?.();
    }
  };

  const handleReveal = () => {
    if (hasRevealed) return;
    setHasRevealed(true);

    gsap.delayedCall(0.3, () => {
      if (!isMountedRef.current) return;

      const reveal = revealRef.current;
      if (!reveal) {
        finishReveal();
        return;
      }

      // circle()'s radius unit accepts plain numbers as px, so a value
      // comfortably larger than the viewport diagonal (rather than a
      // percentage, which circle() resolves against a reference box in
      // ways that vary confusingly by browser) guarantees full coverage
      // at any aspect ratio.
      const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

      gsap.fromTo(
        reveal,
        { clipPath: "circle(0px at 50% 50%)" },
        {
          clipPath: `circle(${maxRadius}px at 50% 50%)`,
          duration: 1,
          ease: "power3.inOut",
          onComplete: finishReveal,
        },
      );
    });
  };

  // The whole site hides the native cursor (see globals.css) and relies
  // on Navbar's custom animated cursor instead — but that element sits
  // below the preloader's z-index, so while the preloader is up there
  // was no visible cursor at all. Restoring the native cursor for as
  // long as the preloader is actually interactive (i.e. until isInert
  // flips true, meaning the reveal has finished and the custom cursor
  // underneath takes back over) fixes that.
  useEffect(() => {
    if (isInert) {
      document.body.classList.remove("preloader-active");
      return;
    }
    document.body.classList.add("preloader-active");
    return () => {
      document.body.classList.remove("preloader-active");
    };
  }, [isInert]);

  // ---------------------------------------------------------------------
  // Intro timeline: counter + flying letters
  // ---------------------------------------------------------------------
  useEffect(() => {
    isMountedRef.current = true;

    // gsap.context scopes every tween created inside the callback so a
    // single .revert() on unmount kills them all — no leaked tweens/timers.
    const ctx = gsap.context(() => {
      if (counterRef.current) {
        const counterObj = { value: 0 };
        gsap.to(counterObj, {
          value: 100,
          duration: 4,
          ease: "power2.out",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(
                Math.floor(counterObj.value),
              ).padStart(3, "0");
            }
          },
          onComplete: () => handleReveal(),
        });
      }

      gsap.to(loaderTextRef.current, {
        autoAlpha: 0,
        duration: 2,
        ease: "power2.inOut",
        delay: 2,
      });

      gsap.to(alphaRefs.current, {
        y: -800,
        x: "random(-120, 120)",
        rotation: "random(-15, 15)",
        duration: "random(5, 8)",
        ease: "sine.out",
        stagger: { each: 0.2, from: "random" },
      });
    }, rootRef);

    return () => {
      isMountedRef.current = false;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-inert={isInert || undefined}
      aria-hidden={isInert || undefined}
    >
      {/* Solid black backdrop that gets circle-clipped away to reveal the
          real page underneath as it expands from the center. */}
      <div ref={revealRef} className={styles.reveal} />

      <div className={styles.loaderPics} aria-hidden="true">
        {letters.map((letter, index) => (
          <div
            key={letter.src}
            className={styles.alpha}
            ref={(el) => {
              alphaRefs.current[index] = el;
            }}
          >
            {/* Decorative, transient intro imagery — a plain <img> avoids
                fighting next/image's required width/height for a purely
                animated, non-LCP element. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={letter.src} alt={letter.alt ?? ""} />
          </div>
        ))}
      </div>

      <div className={styles.loaderText} ref={loaderTextRef}>
        <h1 id="mini-loader-text">{label}</h1>
        <h1 className={styles.bigger} ref={counterRef} aria-live="polite">
          0
        </h1>
      </div>
    </div>
  );
}
