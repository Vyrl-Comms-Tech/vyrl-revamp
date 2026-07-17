"use client";
import { useRef, useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "../../styles/blog-cards.css";
import TextAnimation from "../home/TextAnimation";

gsap.registerPlugin(Flip, ScrollTrigger);

const cards = [
  {
    id: 1,
    category: "NEW",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 2,
    category: "NEW",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 3,
    category: "EDUCATIONAL",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 4,
    category: "EDUCATIONAL",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 5,
    category: "REAL ESTATES",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 6,
    category: "REAL ESTATES",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 7,
    category: "EDUCATIONAL",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 8,
    category: "EDUCATIONAL",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 9,
    category: "REAL ESTATES",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
  {
    id: 10,
    category: "REAL ESTATES",
    image: "/pro1.png",
    title: "The Future of Digital Experiences",
    desc: "Explore how emerging technologies are reshaping the way brands connect with their audiences online.",
    readTime: "5 min read",
    date: "Aug 12, 2026",
  },
];

const BlogCards = ({ active }) => {
  const gridRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
    };
  }, []);

  // Swoop entrance — pair-based, no row wrappers needed
  //
  // This must run as a passive effect (not useLayoutEffect): React fires
  // ALL layout effects across the tree before ANY passive effect, so a
  // useLayoutEffect here would rotate .bc-card-inner via inline transform
  // before TextAnimation's plain useEffect below it ever runs SplitText.
  // SplitText measures line widths via getBoundingClientRect/offsetWidth,
  // and those return bogus (shrunk) values on an element mid-rotation —
  // which baked in wrong, word-per-line splits for every rotated card.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray(".bc-card", gridRef.current);

      cardEls.forEach((card, i) => {
        const inner = card.querySelector(".bc-card-inner");
        gsap.set(inner, {
          y: 1000,
          rotation: i % 2 === 0 ? -60 : 60,
          transformOrigin: "center center",
        });
      });

      for (let i = 0; i < cardEls.length; i += 2) {
        const pair = cardEls.slice(i, i + 2);
        const pairInners = pair.map((c) => c.querySelector(".bc-card-inner"));

        ScrollTrigger.create({
          trigger: pair[0],
          start: "top 60%",
          once: true,
          onEnter: () => {
            gsap.to(pairInners, {
              y: 0,
              rotation: 0,
              duration: 1,
              ease: "power4.out",
              stagger: 0.25,
            });
          },
        });
      }
    }, gridRef);

    return () => ctx.revert();
  }, []);

  // Flip filter — full reorder across the grid
  useLayoutEffect(() => {
    const cardEls = gsap.utils.toArray(".bc-card", gridRef.current);
    if (!cardEls.length) return;

    gsap.killTweensOf(cardEls);

    const cardIsActive = (card) =>
      active === "ALL" || card.dataset.category === active;

    const activeCards = cardEls.filter(cardIsActive);
    const inactiveCards = cardEls.filter((c) => !cardIsActive(c));

    const sortedEls = [...[...activeCards].reverse(), ...inactiveCards];

    const state = Flip.getState(sortedEls, { props: "opacity" });

    cardEls.forEach((card) => {
      const active_ = cardIsActive(card);
      card.style.order = active === "ALL" ? "0" : active_ ? "-1" : "1";
      card.style.opacity = active_ ? "1" : "0.3";
      card.style.pointerEvents = active_ ? "auto" : "none";
    });

    Flip.from(state, {
      duration: 1.25,
      ease: "power3.inOut",
      stagger: { each: 0.055, from: "start" },
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [active]);

  return (
    <section className="bc-section">
      <div className="bc-grid" ref={gridRef}>
        {cards.map(({ id, image, title, desc, readTime, date, category }) => (
          <div key={id} className="bc-card" data-category={category}>
            <article className="bc-card-inner">
              <div className="bc-img">
                <img src={image} alt={title} />
              </div>
              <div className="bc-body">
                <TextAnimation animateOnScroll={false} delay={0.1}>
                  <h3 className="bc-title">{title}</h3>
                </TextAnimation>
                <TextAnimation animateOnScroll={false} delay={0.1}>
                  <p className="bc-desc">{desc}</p>
                </TextAnimation>
                <TextAnimation animateOnScroll={false} delay={0.1}>
                  <p className="bc-meta">
                    {readTime} • {date}
                  </p>
                </TextAnimation>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogCards;
