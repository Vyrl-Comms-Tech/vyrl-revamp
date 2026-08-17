"use client";

/**
 * HeroModelSection
 * -----------------
 * Cinematic pinned hero: a Three.js model scene (loaded from a Three.js
 * Editor / ObjectLoader JSON export) with a scroll-scrubbed video-to-white
 * reveal, split-text intros, and a subtle mouse-parallax camera.
 *
 * Required packages:
 *   npm i three gsap lenis
 *
 * Required static assets (place under /public so Next.js serves them
 * as-is, rather than importing them through webpack):
 *   /public/models/model-1.json
 *   /public/videos/hero-reel.mp4
 *
 * Notes on the conversion from the original vanilla script:
 *   - document.querySelector(...) -> React refs, scoped to this component
 *     instead of global selectors (safe for multiple instances / SSR).
 *   - Binary/JSON assets are no longer bundled via `import`; they're
 *     fetched from /public at runtime so this works cleanly with Next's
 *     asset pipeline and doesn't bloat the JS bundle.
 *   - All GSAP work (SplitText + ScrollTrigger) is scoped with
 *     gsap.context() so it's fully torn down on unmount -> safe for
 *     client-side navigation / React Strict Mode double-invocation.
 *   - Three.js scene, renderer, textures and geometries are explicitly
 *     disposed on unmount to avoid GPU memory leaks in an SPA.
 *   - ScrollTrigger `markers` only render in development.
 *   - `prefers-reduced-motion` is respected: users who request reduced
 *     motion still see the final state, without the scroll-scrubbed
 *     camera/opacity animation.
 *   - No local Lenis instance: this app already runs one global Lenis
 *     (see SmoothScroll.jsx in the root layout), wired to the GSAP
 *     ticker with `lenis.on("scroll", ScrollTrigger.update)`. A second,
 *     independent Lenis instance here used to run in parallel with it —
 *     both smoothing the same native scroll input and calling
 *     ScrollTrigger.update() every tick — which corrupted ScrollTrigger's
 *     pin bookkeeping enough to crash the next pinned section
 *     (Services3d) on scroll. Every other pinned section in this app
 *     reads the single global `window.lenis`; this one does too now.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const MODEL_JSON_PATH = "/Main Scxtion.json";
const VIDEO_PATH = "/banda -v_compressed.mp4";

export default function HeroModelSection() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const heroHeadingRef = useRef(null);
  const centerHeadingRef = useRef(null);
  const tagRef = useRef(null);
  const placeholderTriggerRef = useRef(null);

  // Reserves this section's ~400vh of pinned scroll space *synchronously*,
  // in useLayoutEffect, before paint and before the async model load in
  // the effect below even starts. Every other pinned section on this
  // page (e.g. Services3d) creates its own trigger synchronously too, in
  // its own useLayoutEffect — so without this placeholder, this
  // section's real trigger (created only after `await fetch(...)`
  // resolves in init() below, an async gap of unpredictable length)
  // would come into existence after those other sections had already
  // measured the page *without* this section's pin-spacer. That left
  // their start/end pointing at stale coordinates once this spacer then
  // appeared — observed as Services3d entering its own pin partway
  // through, dead-ending in a blank gap, and showing its last frame
  // overlapped by the Footer. Same start/end/pin as the real timeline's
  // scrollTrigger further down (no scrub content yet — that needs the
  // loaded model's bounding box) so the reserved scroll distance never
  // changes when init() swaps this placeholder out for the real one.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    placeholderTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=400% bottom",
      pin: true,
    });

    return () => {
      placeholderTriggerRef.current?.kill();
      placeholderTriggerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let isMounted = true;
    let renderer;
    let scene;
    let camera;
    let controls;
    let video;
    let ctx;
    let animationFrameId;

    const disposables = [];
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height || !camera || !renderer) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const handleMouseMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    async function init() {
      // ------------------------------------------------------------
      // RENDERER / SCENE / CAMERA
      // ------------------------------------------------------------
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        35,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 8);

      controls = new OrbitControls(camera, renderer.domElement);

      // ------------------------------------------------------------
      // LOAD MODEL JSON
      // ------------------------------------------------------------
      let sceneData;
      try {
        const res = await fetch(MODEL_JSON_PATH);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        sceneData = await res.json();
      } catch (err) {
        console.error("HeroModelSection: failed to load model JSON", err);
        // The placeholder pin (see above) reserved scroll space on the
        // promise this section would eventually load and pin for real —
        // that promise is broken now, so release the reserved space
        // rather than leaving a permanent dead pinned region on the page.
        placeholderTriggerRef.current?.kill();
        placeholderTriggerRef.current = null;
        return;
      }

      if (!isMounted) {
        placeholderTriggerRef.current?.kill();
        placeholderTriggerRef.current = null;
        return;
      }

      const loader = new THREE.ObjectLoader();
      let loadedScene;

      if (sceneData.object) {
        loadedScene = loader.parse(sceneData);
      } else if (sceneData.scene?.object) {
        loadedScene = loader.parse(sceneData.scene);
      } else {
        console.error("HeroModelSection: unrecognized Three.js JSON format");
        placeholderTriggerRef.current?.kill();
        placeholderTriggerRef.current = null;
        return;
      }

      scene.add(loadedScene);

      // ------------------------------------------------------------
      // CENTER + MEASURE MODEL
      // ------------------------------------------------------------
      const box = new THREE.Box3().setFromObject(loadedScene);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      loadedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          materials.forEach((material) => {
            material.transparent = true;
          });
        }
      });

      loadedScene.position.x -= center.x;
      loadedScene.position.y -= 4.8;
      loadedScene.position.z -= center.z;

      const maxSize = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const distance = Math.abs(maxSize / 2 / Math.tan(fov / 2));

      camera.position.z = window.innerWidth < 768 ? 12 : distance * 0.42;
      controls.target.set(0, 0, 0);
      controls.update();

      // ------------------------------------------------------------
      // VIDEO TEXTURE PLANE
      // ------------------------------------------------------------
      video = document.createElement("video");
      video.src = VIDEO_PATH;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = "auto";
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.generateMipmaps = false;

      const planeGeometry = new THREE.PlaneGeometry(2.59, 1.45);

      const planeMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.position.set(0, 0.19, 1.58);
      scene.add(plane);

      const whiteMaterial = new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        // ACESFilmicToneMapping (see renderer.toneMapping above) remaps
        // the whole render output, including flat unlit colors like this
        // reveal plane — so a literal #ffffff was coming out as a warm
        // off-white instead of pure white once tone-mapped. toned: false
        // (three r152+) skips tone mapping for this material specifically
        // so it renders as true #fff regardless of exposure/curve.
        toneMapped: false,
      });
      const whitePlane = new THREE.Mesh(planeGeometry, whiteMaterial);
      whitePlane.position.set(0, 0.19, 1.59);
      scene.add(whitePlane);

      disposables.push(planeGeometry, planeMaterial, whiteMaterial, videoTexture);

      video.play().catch((err) => {
        console.warn("HeroModelSection: video autoplay was blocked", err);
      });

      // ------------------------------------------------------------
      // SMOOTH SCROLL — no local Lenis instance here. SmoothScroll.jsx
      // (mounted once, in the root layout) already creates the single
      // global Lenis, assigns it to window.lenis, drives it off
      // gsap.ticker, and wires lenis.on("scroll", ScrollTrigger.update).
      // This component used to spin up its own second Lenis instance in
      // parallel — both were independently smoothing the same native
      // scroll input and calling ScrollTrigger.update() every tick, so
      // ScrollTrigger's pin bookkeeping (pin-spacer height, scroll
      // offsets) was being fed two different position streams at once.
      // That's what corrupted the pin handoff into Services3d further
      // down the page (white-screen crash on scroll) once this section
      // was added — Services3d itself only ever reads the single global
      // window.lenis, same as every other section in this app.
      // ------------------------------------------------------------

      // ------------------------------------------------------------
      // TEXT + SCROLL-DRIVEN ANIMATION (scoped to this section)
      // ------------------------------------------------------------
      ctx = gsap.context(() => {
        const splitHero = new SplitText(heroHeadingRef.current, {
          type: "words",
        });
        const splitCenter = new SplitText(centerHeadingRef.current, {
          type: "words",
        });

        gsap.from(splitHero.words, {
          yPercent: 150,
          opacity: 0,
          delay: 1,
          scale: 1.2,
          duration: 1,
          stagger: 0.05,
          ease: "power3.out",
        });

        if (!prefersReducedMotion) {
          // Swap out the synchronous placeholder pin (created above,
          // before the model load) for the real scrubbed timeline now
          // that `distance` is known. Same trigger/start/end/pin, so the
          // reserved scroll range this section's spacer occupies never
          // changes across the swap — nothing further down the page
          // needs to re-measure because of this, only because the
          // placeholder existed at all (see its own comment above).
          placeholderTriggerRef.current?.kill();
          placeholderTriggerRef.current = null;

          const modelTrigger = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=400% bottom",
              scrub: 1,
              pin: true,
              // markers: process.env.NODE_ENV === "development",
            },
          });

          modelTrigger
            .to(camera.position, { z: distance * 0.15, ease: "none" }, 0)
            .to(whiteMaterial, { opacity: 1, ease: "none" }, 0)
            .from(
              splitCenter.words,
              {
                opacity: 0,
                scale: 1.5,
                duration: 1,
                stagger: 0.05,
                ease: "power3.out",
              },
              "0.5"
            )
            .from(
              tagRef.current,
              { opacity: 0, duration: 1, stagger: 0.05, ease: "power3.out" },
              "0.5"
            )
            .to(
              heroHeadingRef.current,
              { opacity: 0, scale: 2.5, y: 800, x: 800, duration: 1 },
              "0"
            );
        }
      }, section);

      // Belt-and-suspenders: the placeholder pin created synchronously
      // above (before this async model load ever started) is what
      // actually keeps every other trigger on the page correctly
      // measured throughout — its start/end/pin exactly match the real
      // timeline's own scrollTrigger above, so swapping one for the
      // other never changes the scroll distance this section reserves,
      // and nothing further down the page ever sees this pin-spacer
      // appear or resize out from under it. This refresh is just cheap
      // insurance for anything that measured itself in the single tick
      // between this component mounting and its layout effect running.
      ScrollTrigger.refresh();

      // ------------------------------------------------------------
      // RESIZE + POINTER PARALLAX
      // ------------------------------------------------------------
      window.addEventListener("resize", handleResize);
      window.addEventListener("mousemove", handleMouseMove);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        mouse.x += (targetMouse.x - mouse.x) * 0.04;
        mouse.y += (targetMouse.y - mouse.y) * 0.04;

        camera.position.x = mouse.x * 0.45;
        camera.position.y = -mouse.y * 0.4;
        camera.lookAt(0, 0, 0);

        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    }

    init();

    // ------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------
    return () => {
      isMounted = false;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);

      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }

      disposables.forEach((resource) => resource.dispose?.());
      controls?.dispose();
      renderer?.dispose();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="heroSection">
      <div className="heroHeadingModel">
        <h2 ref={heroHeadingRef} className="heroHeadingModelHeading">
          Shaping The Next Generation Of Digital Experiences.
        </h2>
      </div>

      <canvas
        ref={canvasRef}
        id="cpu"
        className="canvas"
        role="img"
        aria-hidden="true"
      />

      <div className="centerTextHero">
        <div ref={tagRef} className="tag-head tops">
          About
        </div>
        <h2 ref={centerHeadingRef} className="centerTextHeroHeading">
          Vyrl connects strategy, design, and technology to create digital
          experiences that move brands forward.
        </h2>
      </div>
    </section>
  );
}