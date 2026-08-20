
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../../styles/partner-section.css";
import { partners } from "../../data/partners";
import { logoPool } from "../../data/logoPool";

// Registering a browser-only plugin at module scope would break SSR
// (Next renders client components on the server too) — guard it.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * PartnersSection
 * ----------------
 * "Our clients" logo grid with:
 *  1. A scroll-triggered entrance (cards tilt/rise into place).
 *  2. A continuous background shuffle — every few seconds each card
 *     cross-fades into a different logo from a rotating pool, giving
 *     the wall a "live" feel.
 *
 * This is a Client Component (GSAP + ScrollTrigger touch the DOM directly
 * and need timers), unlike the previous static version.
 *
 * @param {Object}  props
 * @param {string}  [props.year]         Year label shown top-right (e.g. "2024").
 * @param {string}  [props.clientCount]  Stat shown bottom-right (e.g. "70+").
 * @param {string}  [props.brand]        Brand name shown bottom-left.
 */
export default function AboutPartnersSection({
  year = "2024",
  clientCount = "70+",
  brand = "VYRL® COMMUNICATIONS",
}) {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const imgRefs = useRef([]);
  imgRefs.current = [];

  const registerImgRef = (el) => {
    if (el) imgRefs.current.push(el);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let cancelled = false;

    // gsap.context scopes every selector text (".partner-card", etc.) below
    // to gridRef.current, and ctx.revert() cleans up every tween/ScrollTrigger
    // created inside it — the React-idiomatic way to avoid leaking GSAP
    // instances across mounts (important with StrictMode's double-invoke).
    const ctx = gsap.context(() => {}, gridRef);

    // bodyColorTl/navbarTl (created below, outside ctx.add()) both target
    // document.body/.nav-bar — elements that live outside gridRef's own
    // subtree and have nothing to do with its scope — and both only get
    // their real .fromTo()/.to() calls added later, via a deferred rAF
    // poll (waiting for AboutUsStack's pin or Navbar.jsx to exist). GSAP's
    // context tracking only applies to calls made SYNCHRONOUSLY while a
    // context is the active one on GSAP's internal context stack; once
    // ctx.add()'s callback returns (which happens immediately — the rAF
    // poll just schedules a callback for later, it doesn't block), that
    // window closes. The poll's eventual .fromTo()/.to() call then runs
    // with no valid active context of its own, which is exactly what
    // produced a recurring "Invalid scope" console warning (GSAP's
    // toArray() couldn't resolve the tween's scope) — retried every
    // single animation frame for as long as ScrollTrigger's ticker
    // touched this tween, hence the huge volume of repeated warnings.
    // Declared here (not inside ctx.add()) and killed directly in this
    // effect's own cleanup instead of relying on ctx.revert() to track
    // them — same "manually create + manually kill" pattern Slider.jsx/
    // Testimonials.jsx already use for their own document.body/navbar
    // polls, which never had this problem for the same reason: they were
    // never nested inside a gsap.context() to begin with.
    const bodyColorTl = gsap.timeline();
    const navbarTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        // Was "bottom bottom" — fires the instant this section's
        // bottom edge touches the very bottom of the viewport, i.e. as
        // early as the section's bottom is even barely visible. That
        // read as too early/no delay. GSAP's second value is how far
        // down the VIEWPORT the trigger point sits — "bottom bottom" =
        // 100% down (the very edge); moving that number DOWN to "90%"
        // makes the element's bottom edge need to travel further up
        // past the viewport before it counts, i.e. MORE scroll, which
        // is what reads as a delay here. Small, deliberate ~10% of a
        // viewport's worth of extra scroll before this starts.
        start: "bottom 90%",
        end: "bottom top",
        scrub: 1,
      },
    });

    // This section sits far down the page, after several large pinned
    // sections (HeroModelSection, Services3d, Work) whose own pin-
    // spacers can still be settling into their final reserved height at
    // the moment this component mounts — same class of bug documented in
    // HeroModelSection.jsx and Work.jsx. Creating the ScrollTrigger
    // synchronously here measured .partners-grid's position against a
    // page that hadn't finished growing to its true final height yet, so
    // "top 85%" was already satisfied at scroll position 0 — the whole
    // gsap.from() entrance (including its own initial from-state:
    // opacity 0.2, rotateX -50) had already played before the page even
    // painted once, which is indistinguishable from "the animation never
    // ran" since the cards just show up fully settled from the very
    // first frame.
    //
    // Same double-rAF defer Work.jsx already uses for its own per-card
    // reveals, for the same reason: one rAF only guarantees a repaint
    // has happened, not that every layout effect above this one (each
    // with their own async pin-spacer setup) has finished growing the
    // page — a second rAF gives those one more full frame to settle
    // before this component measures anything.
    requestAnimationFrame(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;

        ctx.add(() => {
          ScrollTrigger.refresh();

          gsap.from(".partner-card", {
            rotateX: -50,
            y: 100,
            opacity: 0.2,
            transformOrigin: "50% 100%",
            stagger: { each: 0.03, from: "start" },
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              // Was the selector string ".partners-grid" — but gridRef
              // (passed as gsap.context's scope below) IS the
              // .partners-grid element itself, not an ancestor of it.
              // gsap.context's scoped selector resolution only searches
              // *descendants* of the scope root (scope.current.
              // querySelectorAll(...)), so a selector matching the scope
              // root itself can never resolve through it — hence the
              // "Element not found: .partners-grid" warning, and with no
              // valid trigger element ScrollTrigger had nothing to
              // measure or watch, so the tween's "from" state (and the
              // scroll-triggered entrance) never applied at all.
              // Referencing the ref directly sidesteps scoped-selector
              // resolution entirely.
              trigger: gridRef.current,
              start: "top 85%",
              // scrub: true with no explicit `end` was the original bug
              // here — scrub ties the tween's progress directly to
              // scroll position across whatever range the trigger
              // covers, but with no `end` GSAP has nothing to scrub
              // across (defaults to a near-zero-length range at
              // `start`), so the whole staggered entrance collapsed to
              // its very first (or very last) frame instantly instead
              // of ever playing. This is a one-time reveal, not a
              // scroll-scrubbed animation, so it needs toggleActions
              // (play once, on the way in) rather than scrub — same
              // pattern as the per-card reveals in Work.jsx.
              toggleActions: "play none none none",
            },
          });

          ScrollTrigger.refresh();
        });

        // This section sits right after AboutUsStack, which is white
        // while its cards stack/exit — this tween is the white->black
        // handoff into this section's own dark backdrop.
        //
        // Targets document.body, not just sectionRef: painting only
        // this section's own box left the pin-spacer/gap AboutUsStack's
        // pinning leaves behind (and any margin between the two
        // sections) falling through to <body>'s untouched default
        // color, which showed up as a visible white band between two
        // black sections. Testimonials.jsx avoids that same trap by
        // tweening document.body directly, so literally everywhere on
        // the page turns black together no matter what gaps or spacers
        // sit between sections — matched here.
        //
        // Trigger is keyed off AboutUsStack's own pin ScrollTrigger
        // (id: "about-us-stack-pin", set in AboutusStack.jsx), not a
        // position measured against .aboutUsStack's element rect.
        // Earlier attempts anchored to .aboutUsStack's own "bottom"
        // edge (via a plain element trigger + "bottom bottom"/"bottom
        // top") — but while a section is pinned, its own element rect
        // doesn't reliably reflect where the pin-spacer actually ends
        // (that "bottom" kept resolving too early, firing this scrub
        // as early as card 1 or 2 instead of after card 3, since it
        // wasn't actually reading the pin's real scroll distance).
        //
        // pinTrigger.end is the exact scroll position (in px) where
        // AboutUsStack's pin releases — computed by ScrollTrigger
        // itself from the real timeline duration / cardCount driving
        // that pin, so it's correct regardless of card count or
        // viewport size. Used directly as this trigger's numeric
        // `start` (via a function, so it stays live across refreshes
        // rather than a one-time snapshot), with `end` one viewport
        // height further for a real, un-pinned scroll span to scrub
        // across afterward — same idea as Testimonials.jsx's introTl
        // range and AboutUsStack's own foreground-color flip (anchored
        // to that same "last card settled" instant, just measured
        // directly on the timeline instead of through ScrollTrigger).
        //
        // AboutUsStack is a sibling component (AboutusStack.jsx),
        // wrapped in its own LazySection — its pin ScrollTrigger isn't
        // guaranteed to exist yet at this exact moment, so this polls
        // for it by id (same lazy-lookup-with-poll guard used
        // elsewhere in this app for cross-component DOM/ScrollTrigger
        // lookups, e.g. the .nav-bar/.menu-dropdown polls in
        // AboutusStack.jsx and Testimonials.jsx).
        //
        // Appends onto bodyColorTl (declared above, outside ctx.add() —
        // see that declaration's own comment for why), not a brand new
        // standalone tween — same reason Testimonials.jsx's own navbar
        // poll appends onto its already-created `introTl` instead of
        // creating a fresh tween.
        //
        // AboutusStack.jsx's desktop pin (id: "about-us-stack-pin") is
        // hidden via CSS on mobile (see aboutus-stack.css's max-width:
        // 800px block) but its JS still runs and still creates that
        // ScrollTrigger against a hidden element — not a reliable
        // anchor for this tween's position on small screens. Below
        // 800px, AboutusStackMobile.jsx (the visible component there)
        // owns this same white->black body handoff itself, keyed off
        // its own last card instead — so skip it here to avoid two
        // competing body-color tweens firing at different scroll
        // positions.
        const isMobileLayout = window.innerWidth <= 800;

        let pinLookupAttempts = 0;
        const addBodyColorTween = () => {
          if (cancelled || isMobileLayout) return;
          const pinTrigger = ScrollTrigger.getById("about-us-stack-pin");
          if (pinTrigger) {
            bodyColorTl.fromTo(
              document.body,
              { "--bodybg": "#fff" },
              {
                "--bodybg": "#000",
                ease: "none",
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: () => pinTrigger.end,
                  end: () => pinTrigger.end + window.innerHeight,
                  scrub: 1,
                },
              },
            );
            return;
          }
          pinLookupAttempts += 1;
          if (pinLookupAttempts < 30) {
            requestAnimationFrame(addBodyColorTween);
          }
        };
        addBodyColorTween();

        // Navbar whitening, on its own dedicated ScrollTrigger — same
        // code shape as Work.jsx's own navbar-restore tween for its
        // black-backdrop section, just with the trigger being THIS
        // section (sectionRef) coming up from the bottom of the
        // viewport, rather than sharing bodyColorTl's pin-anchored
        // trigger above. A plain, un-pinned "bottom -> top" range on
        // sectionRef gives real, visible scroll motion the whole way
        // through for the scrub to ride, same as every other
        // navbar/body color scrub in this app.
        //
        // .nav-bar/.menu-dropdown live in a sibling component
        // (Navbar.jsx) that isn't guaranteed to have mounted yet at
        // this exact moment — same lazy-lookup-with-poll guard used
        // everywhere else this app reaches across to the navbar.
        let attempts = 0;
        const addNavbarRestoreTween = () => {
          if (cancelled) return;
          const navBar = document.querySelector(".nav-bar");
          const menuDropdown = document.querySelector(".menu-dropdown");
          if (navBar && menuDropdown) {
            navbarTl.to(
              [navBar, menuDropdown],
              {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                ease: "power2.inOut",
              },
              0,
            );
            return;
          }
          attempts += 1;
          if (attempts < 30) requestAnimationFrame(addNavbarRestoreTween);
        };
        addNavbarRestoreTween();
      });
    });

    // Respect reduced-motion: skip the shuffle loop entirely, keep the
    // (already-disabled-by-CSS) entrance as the only motion.
    if (prefersReducedMotion) {
      return () => {
        cancelled = true; // guards the deferred rAFs above if unmount beats them
        ctx.revert();
        // bodyColorTl/navbarTl live outside ctx (see their declaration's
        // own comment for why) — ctx.revert() above doesn't touch them,
        // so they need killing directly. .kill() also kills each
        // tween's own linked ScrollTrigger.
        bodyColorTl.kill();
        navbarTl.kill();
        // Every document.body tween in this app now writes to the
        // shared --bodybg custom property (see globals.css) instead of
        // each section picking its own inline property name — one name
        // to clear, everywhere, instead of needing to guess which of
        // `background`/`backgroundColor` some other section's tween
        // happened to be using at the moment this unmounts. Needed here
        // since this can unmount independently of a full page navigation
        // (e.g. browser back/forward via bfcache) — ordinary navigation
        // is now a hard reload (see pageTransition.js's
        // triggerNavigation()), which tears down document.body's state
        // for free either way.
        gsap.set(document.body, { clearProps: "--bodybg" });
      };
    }

    function changeLogos() {
      const shuffledLogos = shuffle(logoPool);
      imgRefs.current.forEach((img, index) => {
        if (!img) return;
        gsap.to(img, {
          opacity: 0,
          scale: 0.9,
          y: -8,
          duration: 0.3,
          ease: "power2.in",
          delay: index * 0.08,
          onComplete: () => {
            img.src = shuffledLogos[index % shuffledLogos.length];
            gsap.fromTo(
              img,
              { opacity: 0, scale: 1.05, y: 8 },
              { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
            );
          },
        });
      });
    }

    const firstShuffle = gsap.delayedCall(2, changeLogos);

    let loopCall;
    function logoLoop() {
      changeLogos();
      loopCall = gsap.delayedCall(5, logoLoop);
    }
    const startLoop = gsap.delayedCall(7, logoLoop);

    return () => {
      cancelled = true; // guards the deferred rAFs above if unmount beats them
      ctx.revert();
      // bodyColorTl/navbarTl live outside ctx (created above, before
      // ctx.add() — see that declaration's own comment for why), so
      // ctx.revert() doesn't touch them; kill them directly instead.
      // .kill() also kills each tween's own linked ScrollTrigger.
      bodyColorTl.kill();
      navbarTl.kill();
      firstShuffle.kill();
      startLoop.kill();
      loopCall?.kill();
      gsap.killTweensOf(imgRefs.current);
      // Clear both property names — see the identical guard/comment on
      // this same cleanup's other branch (the prefersReducedMotion
      // early return) above for why.
      gsap.set(document.body, { clearProps: "background,backgroundColor" }); // don't leak black bg to other routes
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="logo-section"
      aria-labelledby="partners-heading"
    >
      <div className="partners-section">
        <header className="partners-top">
          <h2 id="partners-heading" className="partners-heading">
            Our Clients
          </h2>
          <span aria-hidden="true">{year}</span>
        </header>

        {/*
          The grid shuffles logos continuously and isn't a reliable source
          of "which brand is this," so the images below are marked
          decorative (alt="") and the real client roster is exposed once,
          statically, for assistive tech.
        */}
        <p className="sr-only">
          Clients include {partners.map((p) => p.name).join(", ")}, and others.
        </p>

        <ul className="partners-grid" ref={gridRef} role="list" aria-hidden="true">
          {partners.map(({ name, src, width, height }, index) => (
            <li key={name} className="partner-card">
              <Image
                ref={registerImgRef}
                src={src}
                alt=""
                width={width}
                height={height}
                className="partner-logo"
                loading={index < 4 ? "eager" : "lazy"}
                sizes="(max-width: 600px) 40vw, (max-width: 900px) 30vw, 22vw"
              />
            </li>
          ))}
        </ul>

        <div className="partners-bottom">
          <span>{brand}</span>
          <span>Clients</span>
          <span>{clientCount}</span>
        </div>
      </div>
    </section>
  );
}