"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "../../styles/collective.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaButton from "../layout/cta";
import TextAnimation from "./TextAnimation";

gsap.registerPlugin(ScrollTrigger);

function Collective() {
  const containerRef = useRef(null);
  const scrollTriggerInstancesRef = useRef([]);
  const router = useRouter();

  const trackScrollTrigger = (instance) => {
    if (instance) {
      scrollTriggerInstancesRef.current.push(instance);
    }
    return instance;
  };

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      scrollTriggerInstancesRef.current.forEach((st) => st.kill());
      scrollTriggerInstancesRef.current = [];

      // Other pinned sections earlier on the page (e.g. the 3D services
      // section) reserve scroll space via their own pin-spacer. If this
      // trigger is created before GSAP has recalculated cached positions
      // against that spacer, its start/end get locked in against a
      // shorter, stale layout and never self-correct. Forcing a refresh
      // immediately before creating this trigger ensures it's built
      // against final layout.
      ScrollTrigger.refresh();

      // Pin distance driven off the container's actual measured pixel
      // height. NOTE: since .collective is 100vh on every device, "2x
      // container height" was still exactly 2 full viewport-heights of
      // scroll everywhere — mathematically identical to the original
      // "+=200%", not actually shorter. That's why mobile stayed sticky
      // for 3-4 scrolls after the last image landed even after this was
      // "fixed" to be measured instead of guessed: measuring the number
      // doesn't help if the multiplier applied to it is still the
      // desktop-tuned one. Mobile now uses 1x container height instead
      // of 2x, roughly halving the pinned scroll distance so it releases
      // close to when the 4th image actually finishes animating out.
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const containerHeight = container.getBoundingClientRect().height;
      const pinMultiplier = isMobile ? 1 : 2;
      const pinEnd = `+=${containerHeight * pinMultiplier}`;

      // The sideways "exit" throw below was a fixed 800px, tuned for
      // desktop-width screens. Even scaled to 60% of viewport width it
      // still flung images most of the way across a narrow phone almost
      // immediately, on top of already starting close to the screen
      // edges — reading as images shooting way off left/right too fast.
      // 30% keeps the same "exits toward the edge" direction/feel but
      // covers much less distance.
      const exitDistance = isMobile ? window.innerWidth * 0.3 : 800;
      // Each box's animation window (how much of the scroll progress it
      // takes to go from "landed" to "fully exited") was the same 0.8 on
      // every device. On mobile that compressed into a much shorter
      // physical scroll, so the same window read as noticeably faster/
      // snappier. Widening it stretches the motion out more gradually.
      const animationWindow = isMobile ? 0.95 : 0.8;

      const animationPattern = ["tpbox1", "tpbox5", "tpbox2", "tpbox6"];

      const boxes = animationPattern
        .map((id) => container.querySelector(`#${id}`))
        .filter(Boolean);

      if (boxes.length === 0) return;

      const rightBoxes = ["tpbox5", "tpbox6"];
      const leftBoxes = ["tpbox1", "tpbox2"];

      // This random per-box vertical drift was a flat ±200px on every
      // device — on mobile's much shorter, tightly-spaced 4-corner
      // layout that's large enough to throw whichever box drew a value
      // near an extreme (e.g. tpbox1 near +200 / tpbox6 near -200) well
      // outside its intended corner, reading as "1st image at the very
      // top, 4th at the very bottom" instead of a subtle wobble. Scaling
      // the range down on mobile keeps a little organic drift without
      // overpowering the balanced corner positions from the CSS.
      const yOffsetRange = isMobile ? 60 : 200;
      const yOffsetMap = {};
      animationPattern.forEach((id) => {
        yOffsetMap[id] = gsap.utils.random(-yOffsetRange, yOffsetRange);
      });

      gsap.set(boxes, {
        scale: 2,
        opacity: 0,
      });

      trackScrollTrigger(
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: pinEnd,
          pin: true,
          scrub: 1,
          id: "collective-main",
          onUpdate: (self) => {
            const progress = self.progress;

            boxes.forEach((box, index) => {
              if (!box) return;

              const delay = index * 0.1;
              const adjustedProgress = Math.max(
                0,
                Math.min(1, (progress - delay) / animationWindow),
              );

              const boxId = box.id;
              const customYOffset = yOffsetMap[boxId] || 0;

              let exitX = 0;
              let exitY = customYOffset * adjustedProgress;

              if (leftBoxes.includes(boxId)) {
                exitX = -exitDistance * adjustedProgress;
              } else if (rightBoxes.includes(boxId)) {
                exitX = exitDistance * adjustedProgress;
              }

              const scaleValue = 1 + 3 * adjustedProgress;
              const opacityValue =
                adjustedProgress < 0.1 ? adjustedProgress * 10 : 1;
              const zValue = 2500 * adjustedProgress;

              gsap.set(box, {
                scale: scaleValue,
                opacity: opacityValue,
                x: exitX,
                y: exitY,
                z: zValue,
                transformOrigin: "center center",
              });
            });
          },
        }),
      );

      const headingElement = container.querySelector("h2");
      if (headingElement) {
        gsap.fromTo(
          headingElement,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: trackScrollTrigger(
              ScrollTrigger.create({
                trigger: container,
                start: "top center",
                end: "20% center",
                scrub: 1,
                id: "collective-heading",
              }),
            ),
          },
        );
      }

      const detailBox = container.querySelector(".tp-detailsbox");
      if (detailBox) {
        gsap.fromTo(
          detailBox,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            scrollTrigger: trackScrollTrigger(
              ScrollTrigger.create({
                trigger: container,
                start: "top center",
                end: "20% center",
                scrub: 1,
                id: "collective-details",
              }),
            ),
          },
        );
      }

      return () => {
        scrollTriggerInstancesRef.current.forEach((st) => st?.kill());
        scrollTriggerInstancesRef.current = [];
      };
    },
    { scope: containerRef, dependencies: [] },
  );

  return (
    <div className="collective" ref={containerRef}>
      <div className="tp-section1">
        <div className="box" id="tpbox1">
          <Image
            src="/arab11.avif"
            alt="Collective work"
            fill
            sizes="(max-width: 768px) 120px, (max-width: 1024px) 150px, 200px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="box" id="tpbox2">
          <Image
            src="/banda4.avif"
            alt="Collective work"
            fill
            sizes="(max-width: 768px) 150px, (max-width: 1024px) 180px, 260px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
      <div className="tp-section2">
        <div className="box" id="tpbox5">
          <Image
            src="/jeikor4.avif"
            alt="Collective work"
            fill
            sizes="260px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="box" id="tpbox6">
          <Image
            src="/sanam5.avif"
            alt="Collective work"
            fill
            sizes="150px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Single centered content block — heading, paragraph, and button
          together, so it's trivially centered on screen at every size
          instead of being split across the two half-width image columns. */}
      <div className="tp-content">
        <h2>
          <TextAnimation animateOnScroll={true} delay={0.3}>
            <span>
              {" "}
              The Collective Behind <br /> Every Experience
            </span>
          </TextAnimation>
        </h2>
        <div className="tp-detailsbox">
          <p className="p-tp-detailsbox">
            Built by a collective of thinkers, makers, developers, creators, and
            growth specialists, all working together to turn bold ideas into
            digital systems that perform.
          </p>
          <div className="buttonsrow">
            <CtaButton
              href="/about"
              variant="dark"
              label="About us"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collective;
