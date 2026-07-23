'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { vertexShader, fragmentShader } from './Shader';
import styles from './Preloader.module.css';

export interface PreloaderLetter {
  src: string;
  alt?: string;
}

export interface PreloaderProps {
  /** Images that fly up-and-away during the intro (defaults spell "LOADING"). */
  letters?: PreloaderLetter[];
  /** Label rendered above the counter. */
  label?: string;
  /** One-shot sfx played the instant the user clicks through. */
  clickSoundSrc?: string;
  /** Looping ambient track started once the reveal completes. */
  ambientSoundSrc?: string;
  /** Tint for the shader's dissolve glow (any CSS color string). */
  borderColor?: string;
  /** Called once the dissolve transition has fully finished. */
  onFinish?: () => void;
}

const DEFAULT_LETTERS: PreloaderLetter[] = [
  { src: '/loader/l.jpg' },
  { src: '/loader/o.png' },
  { src: '/loader/a.jpg' },
  { src: '/loader/d.jpg' },
  { src: '/loader/i.png' },
  { src: '/loader/n.jpg' },
  { src: '/loader/g.png' },
];

export default function Preloader({
  letters = DEFAULT_LETTERS,
  label = 'Loading Experience',
  clickSoundSrc = '/loader/audio-1.mp3',
  ambientSoundSrc,
  borderColor = '#ff69b4',
  onFinish,
}: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clickPromptRef = useRef<HTMLButtonElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const alphaRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Populated inside the Three.js effect, read by the click handler below —
  // this is why it needs to be a ref rather than a plain local variable.
  const uniformsRef = useRef<{
    uTransition: { value: number };
    uResolution: { value: THREE.Vector2 };
    uTime: { value: number };
    uBorderColor: { value: THREE.Color };
  } | null>(null);

  const isMountedRef = useRef(true);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isInert, setIsInert] = useState(false);

  // The whole site hides the native cursor (see globals.css) and relies
  // on Navbar's custom animated cursor instead — but that element sits
  // below the preloader's z-index, so while the preloader is up there
  // was no visible cursor at all. Restoring the native cursor for as
  // long as the preloader is actually interactive (i.e. until isInert
  // flips true, meaning the dissolve reveal has finished and the
  // custom cursor underneath takes back over) fixes that.
  useEffect(() => {
    if (isInert) {
      document.body.classList.remove('preloader-active');
      return;
    }
    document.body.classList.add('preloader-active');
    return () => {
      document.body.classList.remove('preloader-active');
    };
  }, [isInert]);

  // ---------------------------------------------------------------------
  // Three.js shader plane + GSAP intro timeline
  // ---------------------------------------------------------------------
  useEffect(() => {
    isMountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const uniforms = {
      uTransition: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uTime: { value: 0 },
      uBorderColor: { value: new THREE.Color(borderColor) },
    };
    uniformsRef.current = uniforms;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let rafId = 0;
    const tick = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    // gsap.context scopes every tween created inside the callback so a
    // single .revert() on unmount kills them all — no leaked tweens/timers.
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(clickPromptRef.current, { display: 'block', opacity: 1 });
        gsap.set(loaderTextRef.current, { autoAlpha: 0 });
        return;
      }

      if (counterRef.current) {
        const counterObj = { value: 0 };
        gsap.to(counterObj, {
          value: 100,
          duration: 4,
          ease: 'power2.out',
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(
                Math.floor(counterObj.value),
              ).padStart(3, '0');
            }
          },
        });
      }

      gsap.to(loaderTextRef.current, {
        autoAlpha: 0,
        duration: 2,
        ease: 'power2.inOut',
        delay: 2,
      });

      gsap.to(clickPromptRef.current, {
        display: 'block',
        opacity: 1,
        delay: 3,
        duration: 0.5,
        ease: 'power2.inOut',
      });

      gsap.to(alphaRefs.current, {
        y: -800,
        x: 'random(-120, 120)',
        rotation: 'random(-15, 15)',
        duration: 'random(5, 8)',
        ease: 'sine.out',
        stagger: { each: 0.2, from: 'random' },
      });
    }, rootRef);

    return () => {
      isMountedRef.current = false;
      ctx.revert();
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      uniformsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------
  // Click-through: fade the prompt, then dissolve the shader plane
  // ---------------------------------------------------------------------
  const handleReveal = () => {
    if (hasRevealed) return;
    setHasRevealed(true);

    const clickSound = new Audio(clickSoundSrc);
    clickSound.volume = 0.8;
    clickSound.preload = 'auto';

    gsap.to(clickPromptRef.current, {
      opacity: 0,
      y: -25,
      duration: 0.5,
      ease: 'power2.inOut',
    });

    gsap.delayedCall(1, () => {
      if (!isMountedRef.current) return;

      clickSound.currentTime = 0;
      clickSound.play().catch(() => {
        /* Autoplay can be blocked until a user gesture — click already is one, so this is a rare edge case. */
      });

      const uniforms = uniformsRef.current;
      if (!uniforms) return;

      // .root's own solid black backdrop (needed to stop the page
      // flashing through before the dissolve even starts) must clear in
      // step with the shader's own dissolve, not just at the very end —
      // otherwise the shader's transparent pixels only ever reveal this
      // div's opaque black background instead of the real page
      // underneath for the whole 3s the dissolve is playing.
      if (rootRef.current) {
        gsap.to(rootRef.current, {
          backgroundColor: 'rgba(0,0,0,0)',
          duration: 3,
          ease: 'power2.inOut',
        });
      }

      gsap.to(uniforms.uTransition, {
        value: 1,
        duration: 3,
        ease: 'power2.inOut',
        onComplete: () => {
          if (!isMountedRef.current) return;
          setIsInert(true);

          if (ambientSoundSrc) {
            const ambient = new Audio(ambientSoundSrc);
            ambient.loop = true;
            ambient.volume = 0.6;
            ambient.currentTime = 0;
            ambient.play().catch(() => {});
          }

          // Fades .root out (it has its own opacity transition already)
          // before calling onFinish, which unmounts the whole Preloader
          // in PreloaderGate.tsx — the shader canvas's render loop never
          // stops otherwise, and its fragment shader paints solid black
          // wherever neither the dissolve edge nor noise strength is lit
          // up, which is what showed as a permanent black rectangle over
          // the real page instead of the dissolve actually finishing.
          if (rootRef.current) {
            gsap.to(rootRef.current, {
              opacity: 0,
              duration: 0.5,
              ease: 'power2.inOut',
              onComplete: () => onFinish?.(),
            });
          } else {
            onFinish?.();
          }
        },
      });
    });
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-inert={isInert || undefined}
      aria-hidden={isInert || undefined}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <button
        ref={clickPromptRef}
        type="button"
        className={styles.clickPrompt}
        onClick={handleReveal}
      >
        Let&rsquo;s get started
      </button>

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
            <img src={letter.src} alt={letter.alt ?? ''} />
          </div>
        ))}
      </div>

      <div className={styles.loaderText} ref={loaderTextRef}>
        <h1>{label}</h1>
        <h1 className={styles.bigger} ref={counterRef} aria-live="polite">
          0
        </h1>
      </div>
    </div>
  );
}
