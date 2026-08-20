"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/aboutus-stack-mobile.css";
import VyrlCtaButton from "../layout/VyrlCtaButton";

gsap.registerPlugin(ScrollTrigger);

/**
 * Mobile-only counterpart to AboutusStack.jsx. AboutusStack's pinned
 * GSAP stack/step-scroll mechanic is a desktop-shaped interaction (see
 * AboutusStack.jsx's isMobile branch already fighting to adapt it to
 * touch) — rather than keep patching that same pin around small
 * viewports, this renders the same three cards as simple static cards,
 * one per row, matching TextAndCards.jsx's .hs-card mobile treatment
 * (see text-and-cards.css's max-width: 840px block) instead of trying
 * to make a pin/stack animation behave on mobile. Both this and
 * AboutusStack mount in about/page.jsx; CSS (not JS) decides which one
 * is visible per breakpoint, so only one's animation logic ever runs
 * with layout that matches it, and the other still exists (display:
 * none) rather than being conditionally unmounted.
 */
const CARDS = [
  {
    id: "keychain",
    tag: "Purpose",
    title: "Impact Comes First",
    video: "/video02_compressed.mp4",
    poster: "/video02_compressed.avif",
    description:
      "We care about what the work does, not just how it looks. Every idea, interface, campaign, and system is built with a clear reason behind it — to help your brand earn attention, build trust, and move people toward action",
  },
  {
    id: "video-4",
    tag: "Tailored",
    title: "Built Around The Client",
    video: "/stack1_compressed.mp4",
    poster: "/stack1_compressed.avif",
    description:
      "No two brands need the same path. We take time to understand your business, audience, challenges, and goals before shaping the strategy — so the final output feels aligned, useful, and made for your next stage of growth.",
  },
  {
    id: "video-3",
    tag: "Evolution",
    title: "Always Getting Sharper",
    video: "/stack2_compressed.mp4",
    poster: "/stack2_compressed.avif",
    description:
      "The digital world changes fast, and we believe our thinking should move faster. We keep refining our process, testing new tools, studying what works, and improving how we create so every client gets the benefit of what we learn next.",
  },
];

export default function AboutusStackMobile() {
  const sectionRef = useRef(null);
  const ctaRef = useRef(null);

  // Each card rises slightly from below (y), scales up from 0.7, rotates
  // in from a stronger tilt, and fades up from 0.8 opacity as it scrolls
  // into view — same per-card scroll-trigger shape as TextAndCards.jsx's
  // desktop entrance, adapted for this section's own mobile cards.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const cards = gsap.utils.toArray(".aboutStackMobile-card", section);
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // The per-card entrance (tilt/scale/rise) is skipped under reduced
      // motion, but the body-color handoff below still needs to run
      // regardless — it's a scroll-position-driven backdrop swap, not a
      // decorative motion effect, and skipping it too would leave <body>
      // stuck white going into AboutPartnerSection's black backdrop.
      if (!reduceMotion) {
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 60, rotate: 8, scale: 0.7, opacity: 0.8 },
            {
              y: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                end: "top 55%",
                scrub: 0.6,
              },
            },
          );
        });
      }

      // White->black page backdrop handoff into AboutPartnerSection
      // (the "Our Clients" logo grid right after this one), matching
      // AboutusStack.jsx's desktop version of the same handoff — that
      // one is keyed off its own pinned ScrollTrigger's end position,
      // but this section isn't pinned, so it's keyed directly off the
      // LAST card here instead: once the last card has fully scrolled
      // past (its own entrance tween complete), <body> scrubs from
      // white to black over the following viewport height. Targets
      // document.body rather than this section's own box so gaps/
      // margins between sections turn black together too, same
      // reasoning as AboutPartnerSection.jsx's own body tween.
      //
      // AboutPartnerSection.jsx skips its own (desktop-anchored) body
      // tween below the 800px breakpoint specifically so this one is
      // the only one driving <body>'s color on mobile.
      const lastCard = cards[cards.length - 1];
      if (lastCard) {
        gsap.fromTo(
          document.body,
          { "--bodybg": "#fcfcfc" },
          {
            "--bodybg": "#000000",
            ease: "none",
            scrollTrigger: {
              trigger: lastCard,
              start: "bottom center",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        // CTA flips to the white/invert variant in step with the same
        // body handoff above. VyrlCtaButton (see this file's render
        // below) has no separate arrow-badge/label elements to tween
        // the way the old CtaButton-based version did — its white/black
        // flip is a single CSS class (.vyrl-cta--invert, see
        // vyrl-cta-button.css) toggled on the root .vyrl-cta element.
        //
        // Not GSAP's className tween ("+=vyrl-cta--invert"): that
        // relative-value shorthand is for numeric properties, and on
        // className it doesn't add a class — it replaces the entire
        // class attribute with the literal string "+=vyrl-cta--invert",
        // wiping out .vyrl-cta and .vyrl-cta--solid outright (confirmed
        // live: className read back exactly that literal string once
        // scrolled past this trigger). This range has scrub:true (a
        // continuous, non-discrete crossing, unlike AboutusStack.jsx's
        // single-instant timeline position), so onEnter/onLeaveBack —
        // fired once each at the range's start/end edges — toggle the
        // class directly via classList instead.
        const ctaRoot = ctaRef.current?.querySelector(".vyrl-cta");

        if (ctaRoot) {
          ScrollTrigger.create({
            trigger: lastCard,
            start: "bottom center",
            end: "bottom top",
            onEnter: () => ctaRoot.classList.add("vyrl-cta--invert"),
            onLeaveBack: () => ctaRoot.classList.remove("vyrl-cta--invert"),
          });
        }
      }
    },
    { scope: sectionRef },
  );

  // useGSAP's own automatic cleanup (ctx.revert() on unmount) restores
  // document.body's background to whatever it was immediately BEFORE
  // the white -> black tween above ran, not to a genuinely cleared
  // default — same gap Slider.jsx/Work.jsx/Testimonials.jsx/
  // ProjectsGrid.jsx/AboutPartnerSection.jsx all guard against with an
  // explicit clearProps on their own unmount. Decoupled into its own
  // effect (rather than inside the useGSAP callback above) since
  // useGSAP's callback doesn't get a chance to run extra cleanup logic
  // of its own beyond what ctx.revert() already does automatically —
  // this runs as a genuinely separate unmount step, after that revert.
  useEffect(() => {
    return () => {
      // Every document.body tween in this app now writes to the shared
      // --bodybg custom property (see globals.css) instead of each
      // section picking its own inline property name — needed here since
      // this can unmount independently of a full page navigation (e.g.
      // this section's own effect re-running, browser back/forward via
      // bfcache). Ordinary navigation is now a hard reload (see
      // pageTransition.js's triggerNavigation()), which tears down
      // document.body's state for free either way.
      gsap.set(document.body, { clearProps: "--bodybg" });
    };
  }, []);

  // Same lazy-video pattern as TextAndCards.jsx: only load/play a
  // card's video once it's actually near the viewport, and pause it
  // once scrolled past, instead of every card decoding at once.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const videos = Array.from(section.querySelectorAll("video[data-src]"));
    if (!videos.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (!video.src) {
              video.src = video.dataset.src;
              video.load();
            }
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15, rootMargin: "100px 0px" },
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="aboutStackMobile" ref={sectionRef}>
      <div className="aboutStackMobile-grid">
        {CARDS.map((card) => (
          <article key={card.id} className="aboutStackMobile-card">
            <div className="aboutStackMobile-media">
              <video
                data-src={card.video}
                poster={card.poster}
                muted
                loop
                playsInline
                preload="none"
                disablePictureInPicture
                aria-hidden="true"
              />
            </div>

            <div className="aboutStackMobile-content">
              <div>

              <span className="aboutStackMobile-tag">{card.tag}</span>
              <h2 className="aboutStackMobile-title">{card.title}</h2>
              </div>
              <div>
              <p className="aboutStackMobile-desc">{card.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="aboutStackMobile-cta" ref={ctaRef}>
        <VyrlCtaButton label="Explore Services" href="/services" className="vyrl-cta--solid" />
      </div>
    </div>
  );
}
