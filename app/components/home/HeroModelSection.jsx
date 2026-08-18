"use client";

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

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
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
      "(prefers-reduced-motion: reduce)",
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
        1000,
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

      disposables.push(
        planeGeometry,
        planeMaterial,
        whiteMaterial,
        videoTexture,
      );

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
              "0.5",
            )
            .from(
              tagRef.current,
              { opacity: 0, duration: 1, stagger: 0.05, ease: "power3.out" },
              "0.5",
            )
            .to(
              heroHeadingRef.current,
              {
                opacity: 0,
                scale: 2.5,
                // Mobile throws the heading toward the opposite corner
                // (up-left, negative y/x) instead of desktop's
                // down-right (positive y/x) — same "flies off scale
                // during the scroll-scrub" exit, just a different exit
                // direction to match how much less room there is beside
                // the heading on a narrow viewport.
                y: window.innerWidth < 768 ? -800 : 800,
                x: window.innerWidth < 768 ? -100 : 800,
                duration: 1,
              },
              "0",
            );

          // Navbar is a fixed, always-mounted element in the root layout
          // (see Navbar.jsx) — not scoped inside this section, so it's
          // reached by class selector rather than a ref passed down.
          // .nav-bar's own resting background is a faint 5%-white tint
          // (see navbar.css) that reads dark against this hero's
          // model/video but would nearly disappear once whiteMaterial
          // (above) fades the scene to white behind centerTextHero — this
          // tween darkens the navbar to solid black on the same scrub
          // timeline, at the same "0.5" position centerTextHero's own
          // content reveals at, so the two change together.
          //
          // Added to the timeline separately (not chained into the
          // .to(...) sequence above) and polled for briefly first: GSAP
          // resolves a string target once, synchronously, when .to() is
          // called — it doesn't re-check later. Navbar.jsx is a sibling
          // component with its own client-side setup (SplitText on nav
          // links, menu refs, etc.), which in practice can still be
          // mounting its .nav-bar div at the exact moment this runs, even
          // though this whole init() already waited on an async model
          // fetch first — reproduced via a genuine "GSAP target .nav-bar
          // not found" console warning on a fresh load, meaning the tween
          // silently never got added. A few-frame poll here is cheap and
          // only affects this cosmetic addition — the core pin/scrub
          // timeline above (which every other section's scroll math
          // depends on) is built immediately as before, unaffected by
          // whether the navbar has mounted yet.
          // .menu-dropdown is the navbar's expandable menu panel (see
          // Navbar.jsx) — same faint translucent resting background as
          // .nav-bar (navbar.css), so it needs the same treatment for the
          // same reason: without it, opening the menu while this section
          // is showing its white centerTextHero background would read as
          // barely-there instead of a solid black panel matching the bar
          // it drops from.
          let attempts = 0;
          const addNavbarTween = () => {
            if (!isMounted) return;
            const navBar = document.querySelector(".nav-bar");
            const menuDropdown = document.querySelector(".menu-dropdown");
            if (navBar && menuDropdown) {
              modelTrigger.to(
                [navBar, menuDropdown],
                { backgroundColor: "#0a0a0a", ease: "power2.inOut" },
                "0.2",
              );
              return;
            }
            attempts += 1;
            if (attempts < 30) requestAnimationFrame(addNavbarTween);
          };
          addNavbarTween();
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
          Shaping The <br /> Next Generation <br /> Of Digital Experiences.
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
