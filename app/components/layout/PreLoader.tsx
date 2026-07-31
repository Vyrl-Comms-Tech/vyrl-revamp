"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Preloader.module.css";
import { warmUpServices3d } from "@/app/lib/services3dRenderer";

// Read by PreloaderGate.tsx's beforeInteractive skip-script (stamped on
// <html> before hydration/paint) — kept here so both files can import it
// without an import cycle between PreLoader.tsx and PreloaderGate.tsx.
export const PRELOADER_SKIP_CLASS = "preloader-skip";

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
  // Reveal: once the intro (counter/letters) finishes, a circular
  // clip-path on the black backdrop (revealRef) grows from a single
  // point at center out past the viewport's corners, uncovering the
  // real page underneath as it expands — CSS/GSAP only, no WebGL or
  // Three.js (the original shader-based dissolve was too heavy and got
  // removed entirely). This animates clip-path directly rather than a
  // scaled transform: GSAP's transform-based tweens (x/y/scale) replace
  // the *entire* transform property, which silently discarded this
  // element's own translate(-50%,-50%) centering the moment a scale
  // tween started — clip-path has no such conflict.
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

      // Radius comfortably larger than the viewport diagonal guarantees
      // full coverage at any aspect ratio once the circle finishes growing.
      const maxRadius = Math.hypot(window.innerWidth, window.innerHeight);

      gsap.fromTo(
        reveal,
        { clipPath: "circle(0px at 50% 50%)" },
        {
          clipPath: `circle(${maxRadius}px at 50% 50%)`,
          duration: 1.4,
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
  // Also drives the scroll lock (html.preloader-active in globals.css,
  // plus SmoothScroll.jsx stopping Lenis). The preloader's overlay only
  // ever blocked things visually — the real page underneath stayed fully
  // scrollable the whole ~4s intro, so a user who scrolled during that
  // window ended up wherever they'd scrolled to (footer, even) the
  // instant the overlay faded, instead of at the hero. This component
  // still mounts and runs its full timeline even when the beforeInteractive
  // script has already hidden it via PRELOADER_SKIP_CLASS (see
  // PreloaderGate.tsx) on repeat page loads within the same session — so
  // without this check, every one of those invisible replays would also
  // lock scrolling for ~4s on an otherwise-ready page.
  useEffect(() => {
    const skipped = document.documentElement.classList.contains(
      PRELOADER_SKIP_CLASS,
    );

    if (isInert || skipped) {
      document.documentElement.classList.remove("preloader-active");
      document.body.classList.remove("preloader-active");
      return;
    }

    window.scrollTo(0, 0);
    document.documentElement.classList.add("preloader-active");
    document.body.classList.add("preloader-active");
    return () => {
      document.documentElement.classList.remove("preloader-active");
      document.body.classList.remove("preloader-active");
    };
  }, [isInert]);

  // ---------------------------------------------------------------------
  // Warm up heavy below-the-fold assets while the ~4s intro timeline is
  // running anyway, so they're ready by the time the user actually
  // reaches them — fire-and-forget, never blocks or delays the reveal.
  //
  // The services cube needs its GLB fully fetched *and* GLTF-parsed
  // *and* DRACO-decoded, not just downloaded — a plain fetch() only
  // warms the HTTP cache, but the parse/decode step is what actually
  // took visible time once the section mounted (especially on
  // /services, which isn't lazy-loaded at all and starts loading the
  // instant that page opens). warmUpServices3d() does that fetch/parse/
  // decode *and* also compiles the cube's shaders once, hidden, on a
  // shared offscreen renderer (see services3dRenderer.js) — the actual
  // GPU-driver compile cost is a separate, much bigger stall than the
  // asset loading alone, and this is what lets it land here instead of
  // mid-scroll once any Services3d instance (home or /services) mounts.
  // ---------------------------------------------------------------------
  useEffect(() => {
    warmUpServices3d('/cube1.glb');

    const unicornScriptSrc =
      'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.8/dist/unicornStudio.umd.js';
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = unicornScriptSrc;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

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
          value: 101,
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
      {/* Solid black backdrop that slides up and off-screen to reveal
          the real page underneath. */}
      <div className={styles.revealWrap}>
        <div ref={revealRef} className={styles.reveal} />
      </div>

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
            <img src={letter.src} alt={letter.alt ?? ""} height={228} width={193}/>
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
