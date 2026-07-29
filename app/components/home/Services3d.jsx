"use client";
import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import "../../styles/services-3d.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CtaButton from "../layout/cta";
import { loadGLTF } from "@/app/lib/glbCache";

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
  const pathname = usePathname();
  const ctaClassName = pathname === "/services" ? "cta-button-white" : "";
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

    const isMobile = window.innerWidth <= 700;

    // Scroll progress is written by ScrollTrigger's onUpdate below (always
    // runs) and read by the cube's render loop (only runs when WebGL is
    // available) — declared here so both sides can see it regardless of
    // which branch below actually executes.
    let scrollProgress = 0;
    let handleResize = null;

    // The render loop below used to run forever via requestAnimationFrame
    // regardless of whether this section was ever scrolled back into
    // view — full Three.js render + OrbitControls damping + AnimationMixer
    // work, every frame, for as long as the page stayed open, even after
    // scrolling down to Logos/ClientReviews/Collective. Gating actual
    // frame work behind this flag (kept in sync by the IntersectionObserver
    // below) means the loop still ticks but does nothing once offscreen.
    let isVisible = true;
    let cleanupVisibilityObserver = null;
    let cleanupResizeTimeout = null;

    // ------------------------------------------------
    // Scene / Camera / Renderer (only when WebGL is available)
    // ------------------------------------------------
    let renderer, controls, rafId;
    let cancelled = false;

    // Some environments (sandboxed browsers, disabled GPU/hardware
    // acceleration, certain VMs/remote desktops) can't create a WebGL
    // context at all — THREE.WebGLRenderer's constructor throws in that
    // case rather than failing silently. A cheap probe on a throwaway
    // canvas isn't reliable proof either way (it can succeed even when
    // the real renderer construction below still fails), so the actual
    // construction itself is the real test, wrapped in try/catch. Only
    // the 3D setup is skipped when it fails — the scroll-pin,
    // text-cycling, and counters must keep working regardless of
    // whether the cube can render.
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      renderer = null;
    }

    if (renderer) {
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

      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(cubeMount.clientWidth, cubeMount.clientHeight);
      // Starts hidden and fades in once the model has actually loaded
      // (see loader.load below) — the GLB is now prefetched during the
      // preloader (see PreLoader.tsx), so by the time this section is
      // reached the model can finish loading almost instantly, which
      // made it hard-pop into view instead of loading in gradually.
      renderer.domElement.style.opacity = "0";
      renderer.domElement.style.transition = "opacity 0.6s ease-out";
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
      // Model — loadGLTF shares a single GLTFLoader/DRACOLoader (WASM
      // decoder) and a module-level cache across every Services3d
      // instance (home, /services, back/forward nav between them) and
      // the preloader's own warmup call, so the fetch+parse+decode work
      // only ever happens once per session; every later mount here
      // resolves from cache almost instantly.
      // ------------------------------------------------
      const pivot = new THREE.Group();
      scene.add(pivot);

      let mixer;

      loadGLTF(modelUrl).then((gltf) => {
        if (cancelled) return;
        // .clone() because the cached gltf.scene is the same object
        // instance shared with every other consumer (e.g. home and
        // /services both mounting around the same navigation) — adding
        // it directly to this pivot would reparent it out of any other
        // scene graph currently using it.
        const model = gltf.scene.clone(true);
        pivot.add(model);

        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        requestAnimationFrame(() => {
          renderer.domElement.style.opacity = "1";
        });
      });

      // ------------------------------------------------
      // Resize
      // ------------------------------------------------
      // Debounced — window "resize" fires continuously while a window is
      // being dragged (or on mobile, as browser chrome shows/hides during
      // scroll), and ScrollTrigger.refresh() alone is a full recompute of
      // every trigger's position on the entire page, not just this one.
      // Running that dozens of times a second during a drag-resize was a
      // real, avoidable cost.
      let resizeTimeout;
      cleanupResizeTimeout = () => clearTimeout(resizeTimeout);
      handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = cubeMount.clientWidth / cubeMount.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(cubeMount.clientWidth, cubeMount.clientHeight);
          updateCameraPosition();
          ScrollTrigger.refresh();
        }, 150);
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

      // Only actually running the loop while the section is visible —
      // starting it here means it's already active for the initial
      // render (the IntersectionObserver below hasn't fired its first
      // callback yet at this exact point), and the observer takes over
      // stopping/restarting it after that as the section scrolls in
      // and out of view.
      if (isVisible) animate();

      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            cancelAnimationFrame(rafId);
            animate();
          } else {
            cancelAnimationFrame(rafId);
          }
        },
        { threshold: 0 },
      );
      visibilityObserver.observe(section);

      cleanupVisibilityObserver = () => visibilityObserver.disconnect();
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

          // changeService no-ops internally once index hasn't changed,
          // but this counter tween didn't have that same guard — it
          // created a brand-new tween object on every single scrub tick
          // (many times a second while scrolling) even though the target
          // yPercent was identical to the currently-running tween.
          if (index !== currentIndex) {
            gsap.to(numberDigits, {
              yPercent: -100 * index,
              duration: 1,
              overwrite: true,
            });
          }

          changeService(index);
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
      cancelled = true;
      if (handleResize) window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      cleanupVisibilityObserver?.();
      cleanupResizeTimeout?.();

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
      // Note: the DRACOLoader/GLTFLoader used to load this model are
      // owned by the shared cache module (glbCache.js), not this
      // component — they're intentionally never disposed here, since
      // other Services3d instances (or a future one) may still need
      // them for cache hits.
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
        <CtaButton label="Explore Services" href="/services" className={ctaClassName} />
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
          <CtaButton label="Explore Services" href="/services" className={ctaClassName} />
        </div>
      </div>

      <div className="cube-rotate" ref={cubeMountRef} />
    </section>
  );
}
