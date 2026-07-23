"use client";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import "../../styles/services-3d.css";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CtaButton from "../layout/cta";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    title: "Strategy & Consultancy",
    desc: "Direction before execution. We define the roadmap, audience, positioning, and digital approach your brand needs to grow with clarity.",
    tags: ["STRATEGY", "RESEARCH", "CONSULTING"],
  },
  {
    title: "Branding & Creative Direction",
    desc: " Visual identities, campaign concepts, and creative systems designed to make your brand recognizable, consistent, and memorable.",
    tags: ["BRANDING", "LOGO", "IDENTITY"],
  },
  {
    title: "Web & App Development",
    desc: "High performing websites, apps, and platforms built for speed, usability, scale, and a digital presence that feels premium.",
    tags: ["UI/UX", "FIGMA", "PROTOTYPING"],
  },
  {
    title: "Content & Social Media",
    desc: "Content strategies, social storytelling, reels, campaigns, and always on creative built to keep your brand visible and relevant.",
    tags: ["SPLINE", "THREE.JS", "3D"],
  },
  {
    title: "Performance Marketing",
    desc: "Paid campaigns, landing pages, testing, and optimization designed to turn attention into measurable action.",
    tags: ["SEO", "ADS", "ANALYTICS"],
  },
  {
    title: "AI Automation & Tech Solutions",
    desc: "Smart workflows, CRM systems, lead automation, and custom tech solutions that help your business move faster and work smarter.",
    tags: ["BRANDING", "LOGO", "IDENTITY"],
  },
];

export default function Services3d({ modelUrl = "/cube1.glb", dark = false }) {
  const sectionRef = useRef(null);
  const cubeMountRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const tagsRef = useRef(null);
  const numberDigitsRefs = useRef([]);
  const skipRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cubeMount = cubeMountRef.current;
    const title = titleRef.current;
    const desc = descRef.current;
    const tags = tagsRef.current;
    const numberDigits = numberDigitsRefs.current.filter(Boolean);

    if (!section || !cubeMount || !title || !desc) return;

    // Some environments (sandboxed browsers, disabled GPU/hardware
    // acceleration, certain VMs/remote desktops) can't create a WebGL
    // context at all. THREE.WebGLRenderer still constructs in that case
    // but logs an unhandled console error and leaves a broken canvas.
    // Detect it up front and skip ONLY the 3D setup below when
    // unavailable — the scroll-pin, text-cycling, and counters must
    // keep working regardless of whether the cube can render.
    const hasWebGL = (() => {
      try {
        // A canvas only ever binds to one context type — once
        // getContext("webgl2") succeeds or fails, calling getContext
        // again with a different type on that SAME element always
        // returns null. Each candidate needs its own fresh canvas.
        return (
          !!document.createElement("canvas").getContext("webgl2") ||
          !!document.createElement("canvas").getContext("webgl") ||
          !!document.createElement("canvas").getContext("experimental-webgl")
        );
      } catch {
        return false;
      }
    })();

    const isMobile = window.innerWidth <= 700;

    // Scroll progress is written by ScrollTrigger's onUpdate below (always
    // runs) and read by the cube's render loop (only runs when WebGL is
    // available) — declared here so both sides can see it regardless of
    // which branch below actually executes.
    let scrollProgress = 0;
    let handleResize = null;

    // ------------------------------------------------
    // Scene / Camera / Renderer (only when WebGL is available)
    // ------------------------------------------------
    let renderer, controls, rafId, dracoLoader;

    if (hasWebGL) {
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        45,
        cubeMount.clientWidth / cubeMount.clientHeight,
        0.1,
        100,
      );

      const updateCameraPosition = () => {
        if (window.innerWidth <= 700) {
          camera.position.set(0, 0.5, 6);
        } else {
          camera.position.set(0, 0.5, 3);
        }
      };
      updateCameraPosition();

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(cubeMount.clientWidth, cubeMount.clientHeight);
      cubeMount.appendChild(renderer.domElement);

      // ------------------------------------------------
      // Controls
      // ------------------------------------------------
      // OrbitControls attaches touch listeners that call preventDefault()
      // to suppress the page's default touch-scroll while orbiting — that
      // holds true even with rotate/zoom/pan all disabled, since it still
      // has to distinguish a one-finger orbit gesture from a two-finger
      // pinch. On mobile that swallows the swipe the user meant as a page
      // scroll, so on mobile we simply never attach controls to the canvas.
      controls = isMobile
        ? null
        : new OrbitControls(camera, renderer.domElement);

      if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enableZoom = false;
        controls.enablePan = false;

        // Let it spin freely left/right (full horizontal orbit), but
        // clamp how far it can tilt up/down so it can't flip over the
        // top or bottom and drift off-screen.
        const basePolarAngle = Math.PI / 2; // looking straight at it
        controls.minPolarAngle = basePolarAngle - 0.6; // ~34° up
        controls.maxPolarAngle = basePolarAngle + 0.6; // ~34° down
        controls.rotateSpeed = 0.6;
      }

      // ------------------------------------------------
      // Lights
      // ------------------------------------------------
      scene.add(new THREE.AmbientLight(0xffffff, 2));

      const key = new THREE.DirectionalLight(0xffffff, 4);
      key.position.set(5, 8, 5);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffffff, 2);
      fill.position.set(-5, 3, -5);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 2);
      rim.position.set(0, 5, -10);
      scene.add(rim);

      const mouseLight = new THREE.PointLight(0xffffff, 10, 100);
      mouseLight.position.set(0, 0, 5);
      scene.add(mouseLight);

      // ------------------------------------------------
      // Loaders / Model
      // ------------------------------------------------
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(
        "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
      );
      // Some browsers (seen in Opera, also possible with certain
      // extensions/privacy modes elsewhere) cap how much linear memory a
      // WASM module can request, and Draco's WASM decoder can exceed
      // that and throw "Cannot allocate Wasm memory for new instance".
      // Forcing the JS decoder avoids WASM memory allocation entirely —
      // slightly slower to decode once on load, but works everywhere.
      dracoLoader.setDecoderConfig({ type: "js" });

      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      const pivot = new THREE.Group();
      scene.add(pivot);

      let mixer;

      loader.load(modelUrl, (gltf) => {
        const model = gltf.scene;
        pivot.add(model);

        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
      });

      // ------------------------------------------------
      // Resize
      // ------------------------------------------------
      handleResize = () => {
        camera.aspect = cubeMount.clientWidth / cubeMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(cubeMount.clientWidth, cubeMount.clientHeight);
        updateCameraPosition();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", handleResize);

      // ------------------------------------------------
      // Render loop
      // ------------------------------------------------
      // scrollProgress (outer-scoped) is written by ScrollTrigger's
      // onUpdate below and applied to the mixer every animation frame,
      // right before render — rather than only inside onUpdate — so the
      // cube's assembled pose can never be one frame stale relative to
      // what's actually painted.
      const CLIP_DURATION = 3;
      // Three.js's default LoopRepeat wraps time back to 0 whenever
      // time >= duration (strict >=, see AnimationAction._updateTime).
      // Landing on exactly 3 therefore snapped the cube back to its
      // scattered t=0 pose — this is what "shattered on the last scroll
      // tick / after the pin released" actually was. Never let the target
      // time reach the exact duration.
      const MAX_TIME = CLIP_DURATION - 0.001;

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        // Moderate idle drift on both axes — visible motion, but
        // about a third of the original speed so it doesn't tumble.
        pivot.rotation.y += 0.004;
        pivot.rotation.x += 0.004;
        if (controls) controls.update();
        if (mixer)
          mixer.setTime(Math.min(scrollProgress * CLIP_DURATION, MAX_TIME));
        renderer.render(scene, camera);
      };
      animate();
    }

    // ------------------------------------------------
    // Text + counter change on scroll
    // ------------------------------------------------
    let currentIndex = -1;
    let titleSplit;
    let descSplit;

    const changeService = (index) => {
      if (index === currentIndex) return;
      currentIndex = index;

      gsap.killTweensOf(title);
      gsap.killTweensOf(desc);

      if (titleSplit) titleSplit.revert();
      if (descSplit) descSplit.revert();

      title.textContent = SERVICES[index].title;
      desc.textContent = SERVICES[index].desc;

      titleSplit = new SplitType(title, { types: "lines" });
      descSplit = new SplitType(desc, { types: "lines" });

      const lines = [...titleSplit.lines, ...descSplit.lines];

      gsap.set(lines, { yPercent: 100, opacity: 0 });
      gsap.to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: "power4.out",
      });

      if (tags) {
        const tagEls = tags.querySelectorAll(".service-tag");
        gsap.killTweensOf(tagEls);
        gsap.to(tagEls, {
          scale: 0,
          opacity: 0,
          duration: 0.25,
          stagger: 0.04,
          overwrite: true,
          onComplete: () => {
            tagEls.forEach((el, i) => {
              el.textContent = SERVICES[index].tags[i];
            });
            gsap.fromTo(
              tagEls,
              { scale: 0, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.35,
                stagger: 0.04,
                ease: "back.out(1.7)",
              },
            );
          },
        });
      }
    };

    // initialize with the first service
    title.textContent = SERVICES[0].title;
    desc.textContent = SERVICES[0].desc;
    currentIndex = 0;

    let mainScrollTrigger;
    let removeStepGestureListeners = null;

    if (isMobile) {
      // Mobile: one scroll/swipe gesture = exactly one service change,
      // decoupled from scroll *distance*. The old approach mapped
      // continuous scroll progress to an index (with GSAP snap on top),
      // but iOS's momentum/rubber-band scrolling can under-shoot the
      // distance a single swipe needed to cross a snap boundary and
      // settle back on the previous service instead of the next one.
      // Driving the index directly off wheel/touch deltas — with a
      // cooldown so one gesture can't fire twice — makes each swipe
      // commit to exactly one step, every time.
      const STEP_COOLDOWN = 650; // ms — blocks re-triggering mid-transition
      const WHEEL_THRESHOLD = 12; // px of deltaY to count as an intentional step
      const TOUCH_THRESHOLD = 40; // px of vertical swipe to count as a step

      let stepIndex = 0;
      let locked = false;
      let touchStartY = null;

      // scrollProgress drives the cube's assembly pose (see the render
      // loop above — mixer.setTime(scrollProgress * CLIP_DURATION)) the
      // same way it always did on desktop: as a smoothly tweened value,
      // not a snap-to value. Jumping it straight to the new step's
      // fraction made the cube instantly cut to its new pose instead of
      // assembling/disassembling — this tweens it over the same step
      // duration as everything else so the cube keeps its original
      // scroll-driven look, just advanced by gesture instead of by
      // scroll distance.
      const scrollProgressState = { value: 0 };

      const applyStep = (direction) => {
        if (locked) return;
        const nextIndex = gsap.utils.clamp(
          0,
          SERVICES.length - 1,
          stepIndex + direction,
        );
        if (nextIndex === stepIndex) return; // already at an edge

        locked = true;
        stepIndex = nextIndex;
        const targetProgress = stepIndex / (SERVICES.length - 1);

        gsap.to(scrollProgressState, {
          value: targetProgress,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: () => {
            scrollProgress = scrollProgressState.value;
          },
        });

        changeService(stepIndex);
        gsap.to(numberDigits, {
          yPercent: -100 * stepIndex,
          duration: 1,
          overwrite: true,
        });

        setTimeout(() => {
          locked = false;
        }, STEP_COOLDOWN);
      };

      // Once the user is at an edge (first/last service) and gestures
      // further in that same direction, there's nothing left to step to
      // — let the browser's real scroll through instead of continuing
      // to swallow it, and jump straight to the end/start of the pin's
      // reserved scroll range so it releases on this same gesture rather
      // than requiring the leftover distance to be scrolled through
      // untouched afterward (which is what made it feel like scrolling
      // "did nothing" after reaching the last service).
      const releasePastEdge = (direction) => {
        const st = mainScrollTrigger;
        const scrollerEl = st.scroller;
        const targetScroll =
          direction > 0
            ? st.start + (st.end - st.start) + 1
            : st.start - 1;
        if (scrollerEl === window) {
          window.scrollTo({ top: targetScroll, behavior: "auto" });
        } else {
          scrollerEl.scrollTop = targetScroll;
        }
      };

      const isAtEdge = (direction) =>
        (direction > 0 && stepIndex === SERVICES.length - 1) ||
        (direction < 0 && stepIndex === 0);

      const handleWheel = (e) => {
        if (!mainScrollTrigger.isActive) return;
        const direction = e.deltaY > 0 ? 1 : -1;
        if (isAtEdge(direction)) {
          releasePastEdge(direction);
          return; // don't preventDefault — let this gesture release the pin
        }
        // Only the pinned section should consume the gesture — once
        // pinned, real page scroll is already suspended here, so this
        // just needs to stop the browser's default scroll-through.
        e.preventDefault();
        if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
        applyStep(direction);
      };

      const handleTouchStart = (e) => {
        touchStartY = e.touches[0]?.clientY ?? null;
      };

      const handleTouchMove = (e) => {
        if (!mainScrollTrigger.isActive || touchStartY === null) return;
        const currentY = e.touches[0]?.clientY ?? touchStartY;
        const direction = touchStartY - currentY > 0 ? 1 : -1;
        if (isAtEdge(direction)) return; // let this scroll through normally
        e.preventDefault();
      };

      const handleTouchEnd = (e) => {
        if (!mainScrollTrigger.isActive || touchStartY === null) return;
        const endY = e.changedTouches[0]?.clientY ?? touchStartY;
        const deltaY = touchStartY - endY; // positive = swiped up = advance
        touchStartY = null;
        if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
        const direction = deltaY > 0 ? 1 : -1;
        if (isAtEdge(direction)) {
          releasePastEdge(direction);
          return;
        }
        applyStep(direction);
      };

      section.addEventListener("wheel", handleWheel, { passive: false });
      section.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      section.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      section.addEventListener("touchend", handleTouchEnd, { passive: true });

      removeStepGestureListeners = () => {
        section.removeEventListener("wheel", handleWheel);
        section.removeEventListener("touchstart", handleTouchStart);
        section.removeEventListener("touchmove", handleTouchMove);
        section.removeEventListener("touchend", handleTouchEnd);
      };

      // A fixed-height pin with no scrub — the gesture handlers above
      // drive all state changes directly, this just keeps the section
      // pinned in place while the user is stepping through services.
      // The pinned distance must scale with the number of steps: even
      // with preventDefault() on wheel/touchmove, some residual scroll
      // delta can still leak through per gesture (browser/Lenis
      // handling), so a fixed "+=100%" ran out after only 2-3 steps —
      // the trigger deactivated and unpinned before the user ever
      // reached the later services. One full screen height per service
      // guarantees the pin outlasts stepping through all of them.
      mainScrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${SERVICES.length * 100}%`,
        pin: true,
      });
    } else {
      // Desktop: a long, smoothly-scrubbed distance across all services.
      const scrollDistance = 6000;
      const scrubAmount = 2;

      mainScrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: scrubAmount,
        pin: true,
        onUpdate(self) {
          // Clamped [0,1] here; actually applied to the mixer in the
          // render loop every frame (see animate()) so it's never stale
          // relative to what gets painted, and always holds the assembled
          // pose once progress reaches 1 regardless of scroll direction.
          scrollProgress = Math.min(Math.max(self.progress, 0), 1);

          let index = Math.floor(self.progress * SERVICES.length);
          index = gsap.utils.clamp(0, SERVICES.length - 1, index);
          changeService(index);

          gsap.to(numberDigits, {
            yPercent: -100 * index,
            duration: 1,
            overwrite: true,
          });
        },
      });
    }

    // ------------------------------------------------
    // Skip button — jumps straight past this section's pin, same target
    // math as releasePastEdge (mobile edge-release) above, but scrolled
    // smoothly rather than snapped, since this is a deliberate click
    // rather than a scroll gesture already in motion.
    // ------------------------------------------------
    const handleSkip = () => {
      // +1 alone only crosses the pin's release threshold, landing
      // exactly at the top of the next section — adding half a
      // viewport's worth of extra scroll carries it a bit further so
      // the next section is already partway up the page once it lands.
      const targetScroll =
        mainScrollTrigger.start +
        (mainScrollTrigger.end - mainScrollTrigger.start) +
        window.innerHeight * 0.5;

      // Routed through the global Lenis instance (see SmoothScroll.jsx)
      // rather than window.scrollTo({behavior:"smooth"}) or a GSAP
      // scrollTo tween — either of those would be a second animation
      // fighting Lenis for control of the scroll position every frame.
      if (window.lenis) {
        window.lenis.scrollTo(targetScroll, { duration: 1.6 });
      } else {
        window.scrollTo({ top: targetScroll });
      }
    };

    const skipBtn = skipRef.current;
    skipBtn?.addEventListener("click", handleSkip);

    // ------------------------------------------------
    // Cleanup
    // ------------------------------------------------
    return () => {
      if (handleResize) window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);

      skipBtn?.removeEventListener("click", handleSkip);
      if (removeStepGestureListeners) removeStepGestureListeners();
      mainScrollTrigger.kill();

      if (titleSplit) titleSplit.revert();
      if (descSplit) descSplit.revert();

      if (controls) controls.dispose();
      if (renderer) {
        renderer.dispose();
        if (cubeMount.contains(renderer.domElement)) {
          cubeMount.removeChild(renderer.domElement);
        }
      }
      if (dracoLoader) dracoLoader.dispose();
    };
  }, [modelUrl]);

  return (
    <section
      className={`services-main-section${dark ? " services-main-section--dark" : ""}`}
      ref={sectionRef}
    >
      <div className="counter-divs">
        <div className="static-number">
          {String(SERVICES.length).padStart(2, "0")}
        </div>
        /
        <div className="static-number2">
          {SERVICES.map((_, i) => (
            <div
              className="numbes"
              key={i}
              ref={(el) => (numberDigitsRefs.current[i] = el)}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>

      <div className="services-cta-desktop">
        <CtaButton label="Explore Services" href="/services" />
      </div>

      <button type="button" className="services-skip-btn" ref={skipRef}>
        <span className="services-skip-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M13 5L20 12L13 19M4 5L11 12L4 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Skip this section
      </button>

      <div className="right-text-services">
        <div className="service-tags" ref={tagsRef}>
          {SERVICES[0].tags.map((tag, i) => (
            <span className="service-tag" key={i}>
              {tag}
            </span>
          ))}
        </div>
        <h1 className="service-title" ref={titleRef}>
          {SERVICES[0].title}
        </h1>
        <p className="service-desc" ref={descRef}>
          {SERVICES[0].desc}
        </p>
        <div className="services-cta-mobile">
          <CtaButton label="Explore Services" href="/services" />
        </div>
      </div>

      <div className="cube-rotate" ref={cubeMountRef} />
    </section>
  );
}
