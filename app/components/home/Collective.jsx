'use client'
import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "../../styles/collective.css";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaButton from "../layout/cta";

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

      const animationPattern = ["tpbox1", "tpbox5", "tpbox2", "tpbox6"];

      const boxes = animationPattern
        .map((id) => container.querySelector(`#${id}`))
        .filter(Boolean);

      if (boxes.length === 0) return;

      const rightBoxes = ["tpbox5", "tpbox6"];
      const leftBoxes = ["tpbox1", "tpbox2"];

      const yOffsetMap = {};
      animationPattern.forEach((id) => {
        yOffsetMap[id] = gsap.utils.random(-200, 200);
      });

      gsap.set(boxes, {
        scale: 2,
        opacity: 0,
      });

      trackScrollTrigger(
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "+=200%",
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
                Math.min(1, (progress - delay) / 0.8)
              );

              const boxId = box.id;
              const customYOffset = yOffsetMap[boxId] || 0;

              let exitX = 0;
              let exitY = customYOffset * adjustedProgress;

              if (leftBoxes.includes(boxId)) {
                exitX = -800 * adjustedProgress;
              } else if (rightBoxes.includes(boxId)) {
                exitX = 800 * adjustedProgress;
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
        })
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
              })
            ),
          }
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
              })
            ),
          }
        );
      }

      return () => {
        scrollTriggerInstancesRef.current.forEach((st) => st?.kill());
        scrollTriggerInstancesRef.current = [];
      };
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div className="collective" ref={containerRef}>
      <div className="tp-section1">
        <h2>
          The Collective Behind <br />{" "}
          <span id="colored-text">Every Experience</span>
        </h2>
        <div className="box" id="tpbox1">
          <Image
            src="/img1.jpg"
            alt="Collective work"
            fill
            sizes="(max-width: 768px) 120px, (max-width: 1024px) 150px, 200px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="box" id="tpbox2">
          <Image
            src="/img2.png"
            alt="Collective work"
            fill
            sizes="(max-width: 768px) 150px, (max-width: 1024px) 180px, 260px"
            style={{ objectFit: "cover" }}
          />
        </div>

      </div>
      <div className="tp-section2">
        <div className="tp-detailsbox">
          <p className="p-tp-detailsbox">
            Built by a collective of thinkers, makers, developers, creators,
            and growth specialists, all working together to turn bold ideas
            into digital systems that perform.
          </p>
          <div className="buttonsrow">
            <CtaButton
              className="sale-button"
              variant="dark"
              onClick={() => router.push("/about")}
            >
              About us
            </CtaButton>
      
          </div>
        </div>
        <div className="box" id="tpbox5">
          <Image
            src="/cr1.png"
            alt="Collective work"
            fill
            sizes="260px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="box" id="tpbox6">
          <Image
            src="/cr2.jpg"
            alt="Collective work"
            fill
            sizes="150px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Collective;