"use client";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextAnimation from "./TextAnimation";
import CtaButton from "../layout/cta";
import "../../styles/text-and-cards.css";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    id: 1,
    title: "Strategy",
    dark: true,
    image: null,
    video: "/video02.mp4",
    desc: "Direction that connects brand, audience, and business goals.",
  },
  {
    id: 2,
    title: "Technology",
    dark: false,
    image: null,
    video: null,
    desc: "Websites, apps, platforms, and automation built to perform.",
  },
  {
    id: 3,
    title: "Performance",
    dark: true,
    image: null,
    video: "/video01.mp4",
    desc: "Content, campaigns, and media systems designed to drive measurable growth",
  },
];

export default function TextAndCards() {
  const cardsRef = useRef(null);

  useGSAP(
    () => {
      const cardEls = gsap.utils.toArray(".hs-card");

      gsap.set(cardEls, {
        rotateX: -88,
        y: 390,
        opacity: 0,
        scale: 0.92,
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
        force3D: true,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(cardEls, {
        rotateX: 0,
        y: 0,
        z: 0,
        opacity: 1,
        scale: 1,
        duration: 1.4,
        stagger: { each: 0.18, ease: "power2.out" },
      });

      ScrollTrigger.create({
        trigger: cardsRef.current,
        start: "top 70%",
        end: "+=700",
        scrub: 1.8,
        animation: tl,
        invalidateOnRefresh: true,
      });
    },
    { scope: cardsRef },
  );

  return (
    <>
      <div className="hs-spacer" />
      <div className="text-and-cards">
        <section className="hs-text-section">
          <div className="hs-text-inner">
            <TextAnimation blockColor="#111" stagger={0.12} duration={1.1}>
              <h1 className="hs-heading">
                <span className="hs-heading-indent" aria-hidden="true" />
                Vyrl is a full-stack digital agency building connected
                ecosystems across strategy, branding, content, technology,
                performance, and automation, designed for brands that want to
                stand out, scale, and stay remembered.
              </h1>
            </TextAnimation>

            <CtaButton label="About us" videoSrc="/bg-v.mp4" href="/about" />
          </div>
        </section>

        <section ref={cardsRef} className="hs-cards-section">
          <div className="hs-cards-grid">
            {CARDS.map((card) => (
              <div
                key={card.id}
                className={`hs-card ${card.dark ? "hs-card--dark" : "hs-card--light"} ${
                  card.id === 1 ? "hs-card--small-video" : ""
                }`}
              >
                <h2 className="hs-card-title">{card.title}</h2>

                <div className="hs-card-media">
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="hs-card-media-el"
                      draggable={false}
                    />
                  )}
                  {card.video && (
                    <video
                      className="hs-card-media-el"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source src={card.video} type="video/mp4" />
                    </video>
                  )}
                </div>

                <p className="hs-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
