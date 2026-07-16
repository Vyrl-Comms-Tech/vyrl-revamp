'use client'
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "../../styles/services-3d.css";
import CtaButton from "../layout/cta";

gsap.registerPlugin(ScrollTrigger);


const SERVICES = [
  {
    title: "Strategy & Consultancy",
    desc: "Strategic planning, market insights, and business consulting that help brands make confident decisions and achieve sustainable growth.",
    tags: ["STRATEGY", "RESEARCH", "CONSULTING"],
  },
  {
    title: "Brand Identity",
    desc: "Distinctive visual identities, messaging systems, and brand experiences that create recognition and lasting customer trust.",
    tags: ["BRANDING", "LOGO", "IDENTITY"],
  },
  {
    title: "UI/UX Design",
    desc: "Beautiful, intuitive digital experiences focused on usability, accessibility, and seamless user journeys across every device.",
    tags: ["UI/UX", "FIGMA", "PROTOTYPING"],
  },
  {
    title: "Web & App Development",
    desc: "High-performing websites, apps, and platforms built for speed, usability, scale, and a digital presence that feels premium.",
    tags: ["SPLINE", "THREE.JS", "3D"],
  },
  {
    title: "Digital Marketing",
    desc: "Performance-driven campaigns, SEO, content strategy, and analytics designed to increase visibility, engagement, and conversions.",
    tags: ["SEO", "ADS", "ANALYTICS"],
  }, {
    title: "Brand Identity",
    desc: "Distinctive visual identities, messaging systems, and brand experiences that create recognition and lasting customer trust.",
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
          !!document
            .createElement("canvas")
            .getContext("experimental-webgl")
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
          camera.position.set(0, 0.5, 3.5);
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
      controls = isMobile ? null : new OrbitControls(camera, renderer.domElement);

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
        if (mixer) mixer.setTime(Math.min(scrollProgress * CLIP_DURATION, MAX_TIME));
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

    // Desktop uses a long, smoothly-scrubbed distance across all services.
    // Mobile uses a much shorter distance with lower scrub (less lag per
    // swipe) plus snap points, so each swipe reliably lands on a clean
    // service boundary instead of stalling mid-transition between two.
    const scrollDistance = isMobile ? 2400 : 6000;
    const scrubAmount = isMobile ? 0.5 : 2;
    const snapStep = 1 / (SERVICES.length - 1);

    const mainScrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${scrollDistance}`,
      scrub: scrubAmount,
      pin: true,
      snap: isMobile
        ? {
            snapTo: (value) => Math.round(value / snapStep) * snapStep,
            duration: 0.3,
            ease: "power1.inOut",
          }
        : undefined,
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

    // ------------------------------------------------
    // Cleanup
    // ------------------------------------------------
    return () => {
      if (handleResize) window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);

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
        <CtaButton label="Services" href="/services" />
      </div>

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
          <CtaButton label="Services" href="/services" />
        </div>
      </div>

      <div className="cube-rotate" ref={cubeMountRef} />
    </section>
  );
}