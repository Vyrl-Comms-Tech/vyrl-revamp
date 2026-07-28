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
  /** Looping ambient track started once the reveal completes. */
  ambientSoundSrc?: string;
  /** Tint for the shader's dissolve glow (any CSS color string). */
  borderColor?: string;
  /** Called once the dissolve transition has fully finished. */
  onFinish?: () => void;
}

const DEFAULT_LETTERS: PreloaderLetter[] = [
  { src: '/loader/l.avif' },
  { src: '/loader/o.avif' },
  { src: '/loader/a.avif' },
  { src: '/loader/d.avif' },
  { src: '/loader/i.avif' },
  { src: '/loader/n.avif' },
  { src: '/loader/g.avif' },
];

export default function Preloader({
  letters = DEFAULT_LETTERS,
  label = 'Loading Experience',
  ambientSoundSrc,
  borderColor = '#ff69b4',
  onFinish,
}: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderTextRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const alphaRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Populated inside the Three.js effect, read by handleReveal below —
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

  // ---------------------------------------------------------------------
  // Auto-reveal: once the intro (counter/text) finishes on its own, fade
  // straight into the dissolve — no click needed. Declared before the
  // Three.js mount effect below (which calls this directly) since that
  // effect's no-WebGL branch needs to trigger the reveal immediately, on
  // the same mount pass — calling through a ref assigned in a *later*
  // effect would still be the initial no-op placeholder at that point,
  // and the preloader would never actually reveal the page. Always runs
  // the full counter/letters animation regardless of the visitor's OS
  // "reduce motion" setting — this is a deliberate brand intro, not
  // something to skip for accessibility here.
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

    // Fades .root out (it has its own opacity transition already)
    // before calling onFinish, which unmounts the whole Preloader in
    // PreloaderGate.tsx — the shader canvas's render loop never stops
    // otherwise, and its fragment shader paints solid black wherever
    // neither the dissolve edge nor noise strength is lit up, which is
    // what showed as a permanent black rectangle over the real page
    // instead of the dissolve actually finishing.
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
  };

  const handleReveal = () => {
    if (hasRevealed) return;
    setHasRevealed(true);

    gsap.delayedCall(1, () => {
      if (!isMountedRef.current) return;

      const uniforms = uniformsRef.current;

      // No WebGL (see the mount effect below) means uniforms was never
      // populated — there's no shader dissolve to run, so just fade
      // .root's backdrop straight out and finish.
      if (!uniforms) {
        if (rootRef.current) {
          gsap.to(rootRef.current, {
            backgroundColor: 'rgba(0,0,0,0)',
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: finishReveal,
          });
        } else {
          finishReveal();
        }
        return;
      }

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
        onComplete: finishReveal,
      });
    });
  };

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

    // Some environments (sandboxed/embedded browsers, GPU disabled via
    // flags or policy, certain VMs/remote desktops, or a GPU process
    // that's crashed/exhausted its context limit) can't create a WebGL
    // context — and a cheap probe on a throwaway canvas isn't reliable
    // proof either way: it can succeed even when the *real* renderer
    // below still fails moments later (a second context request hitting
    // the same broken GPU process). So the actual THREE.WebGLRenderer
    // construction itself is the real test, wrapped in try/catch — if it
    // throws, skip Three.js entirely and reveal immediately instead of
    // letting the whole preloader (and the real page underneath it)
    // crash.
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch {
      renderer = null;
    }

    if (!renderer) {
      gsap.set(loaderTextRef.current, { autoAlpha: 0 });
      // Deferred a tick — handleReveal calls setHasRevealed, and setting
      // state synchronously inside an effect body (rather than in
      // response to an event or a later callback) risks cascading
      // renders during this same commit.
      gsap.delayedCall(0, handleReveal);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

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
      renderer!.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer!.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    // gsap.context scopes every tween created inside the callback so a
    // single .revert() on unmount kills them all — no leaked tweens/timers.
    const ctx = gsap.context(() => {
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
          onComplete: () => handleReveal(),
        });
      }

      gsap.to(loaderTextRef.current, {
        autoAlpha: 0,
        duration: 2,
        ease: 'power2.inOut',
        delay: 2,
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
      renderer!.dispose();
      geometry.dispose();
      material.dispose();
      uniformsRef.current = null;
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
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

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
        <h1 id='mini-loader-text'>{label}</h1>
        <h1 className={styles.bigger} ref={counterRef} aria-live="polite">
          0
        </h1>
      </div>
    </div>
  );
}
