"use client";

import { useEffect, useRef } from "react";
import PageTransitionLink from "../layout/PageTransitionLink";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { scheduleScrollTriggerRefresh } from "../../lib/scheduleScrollTriggerRefresh";
import "../../styles/work.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Work items data — single source of truth for cards.
 * `isDark` marks the card that flips <body> to black once it scrolls
 * into view (was hard-coded as class="bg-black" in the original markup).
 * Swap paths for real assets served from /public/assets/...
 */
const WORK_ITEMS = [
  {
    id: "banda",
    title: "BANDA",
    tags: ["GSAP", "RESPONSIVE", "THREE.JS"],
    image: "/banda1.avif",
    video: "/banda -v_compressed.mp4",
    href: "/banda",
  },
  {
    id: "lala-darbar",
    title: "LALA DARBAR",
    tags: ["UIUX", "REACT", "SEO", "GSAP"],
    image: "/lala1.avif",
    video: null,
    href: "/lala-darbar",
  },
  {
    id: "jeikor",
    title: "JEIKOR",
    tags: ["UIUX", "GSAP", "NEXT.JS"],
    image: "/jeikor3.avif",
    video: "/jeikor-v.mp4",
    poster: "/jeikor-v.avif",
    href: "/jeikor",
  },
  {
    id: "sanam-cars",
    title: "SANAM CARS",
    tags: ["NEXT.JS", "FILTERING", "API", "RESPONSIVE"],
    image: "/sanam5.avif",
    video: "/sanam-v_compressed.mp4",
    href: "/sanamcars",
  },
  {
    id: "arabian",
    title: "ARABIAN ESTATES",
    tags: ["CUSTOM DASHBOARD", "GOOGLE MAPS"],
    image: "/arab3.avif",
    video: null,
    href: "/arabian-estate",
    isDark: true,
  },
];

export default function Work() {
  const rootRef = useRef(null);
  const workSectionsRef = useRef(null);
  const headingRef = useRef(null);
  const cardRefs = useRef([]);
  const bgBlackCardRef = useRef(null);

  const registerCardRef = (el, item) => {
    if (!el) return;
    if (!cardRefs.current.includes(el)) cardRefs.current.push(el);
    if (item.isDark) bgBlackCardRef.current = el;
  };

  useEffect(() => {
    let splitHeading;
    let cancelled = false;

    // gsap.context scopes every tween/ScrollTrigger created inside to this
    // component and guarantees clean teardown on unmount (App Router safe).
    const ctx = gsap.context(() => {
      // Hard-set document.body's --bodybg custom property (see
      // globals.css) to white the instant this component mounts,
      // before anything scroll-scrubbed below ever gets a chance to
      // evaluate. bodyTl's own trigger (further down, inside the
      // deferred double-rAF block) is now measured correctly against
      // settled layout — see that block's own comment — but this is a
      // second, unconditional guarantee on top of that: no matter what
      // scroll position the page loads/navigates in at, or whether some
      // future change reintroduces a timing gap in the trigger
      // measurement, this section always starts from a known white
      // state the moment it exists, and only the scrub below ever moves
      // it toward black from there.
      //
      // Targets --bodybg, not the `background` shorthand directly:
      // every document.body tween in this app now writes to this one
      // shared custom property instead of each section picking its own
      // inline property name (`background` here, `backgroundColor` on
      // /about's sections) — that mismatch was clearProps' actual
      // conflict (clearing one property never touched a value the
      // other had written), reported as home showing solid black
      // immediately after navigating from /about. One property name
      // everywhere means one clearProps call clears it, everywhere,
      // guaranteed.
      gsap.set(document.body, { "--bodybg": "#fff" });

      // ==========================================================
      // CARD REVEAL + PARALLAX + HOVER
      // ==========================================================
      cardRefs.current.forEach((card) => {
        const image = card.querySelector(".card-work-cm__image");
        const video = card.querySelector(".card-work-cm__video");
        const tags = card.querySelectorAll(".tags-main");

        gsap.set(card, {
          clipPath: "inset(50% 50% 50% 50%)",
          rotate: "3deg",
        });

        gsap.set(image, {
          scale: 2,
          yPercent: 0,
          transformOrigin: "center center",
        });

        gsap.set(tags, { x: -350 });

        // Deferred like the heading's ScrollTrigger below (see that
        // block's comment for the full reasoning): this card sits close
        // to the pinned heading section thanks to work.css's negative
        // margin-top pulling .work-section-cards up under the pin, so at
        // the moment this component mounts — before every pinned section
        // above it has finished reserving its own scroll space — the
        // card's real on-page position (and therefore "top 60%"'s actual
        // pixel target) is still shifting. Creating these triggers before
        // that settles was firing the reveal essentially immediately
        // (clip-path already open a moment after mount), regardless of
        // the start percentage. ctx.add still ties cleanup to the same
        // gsap.context as everything else.
        requestAnimationFrame(() => {
          if (cancelled) return;
          requestAnimationFrame(() => {
            if (cancelled) return;

            ctx.add(() => {
              const revealTl = gsap.timeline({
                scrollTrigger: {
                  trigger: card,
                  // Was "top 85%" — with scrub:false this timeline just
                  // plays once triggered (end only matters for
                  // toggleActions re-triggering, not pacing), so 85%
                  // fired the clip-path open almost the instant the card
                  // peeked in from the bottom edge, while barely any of
                  // it was actually on screen yet. Delaying the trigger
                  // to "top 60%" means the card has scrolled
                  // substantially further up — most of it already
                  // visible — before it opens, so the reveal reads as
                  // intentional instead of "already open by the time you
                  // notice it."
                  start: "top 60%",
                  end: "top 45%",
                  scrub: false,
                  // markers:true,
                },
              });

              revealTl.to(card, {
                clipPath: "inset(0% 0% 0% 0%)",
                rotate: "0deg",
              });

              revealTl.to(image, { scale: 1.1, duration: 1 }, "<");

              gsap.fromTo(
                image,
                { yPercent: -15 },
                {
                  yPercent: 15,
                  ease: "none",
                  scrollTrigger: {
                    trigger: card,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5,
                    invalidateOnRefresh: true,
                  },
                },
              );

              scheduleScrollTriggerRefresh();
            });
          });
        });

        const handleEnter = () => {
          gsap.to(tags, {
            x: 0,
            duration: 0.7,
            stagger: { each: 0.08, from: "start" },
            ease: "power4.out",
            overwrite: "auto",
          });

          if (video) {
            gsap.to(image, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
            gsap.to(video, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
            video.play?.();
          }
        };

        const handleLeave = () => {
          gsap.to(tags, {
            x: -440,
            duration: 0.6,
            stagger: { each: 0.06, from: "start" },
            ease: "power4.inOut",
            overwrite: "auto",
          });

          if (video) {
            video.pause();
            gsap.to(video, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
            gsap.to(image, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };

        card.addEventListener("mouseenter", handleEnter);
        card.addEventListener("mouseleave", handleLeave);

        card.__cleanupHover = () => {
          card.removeEventListener("mouseenter", handleEnter);
          card.removeEventListener("mouseleave", handleLeave);
        };
      });

      // ==========================================================
      // HEADING SPLIT-TEXT EXIT (pinned section)
      // ==========================================================
      if (headingRef.current) {
        splitHeading = new SplitText(headingRef.current, { type: "chars" });

        gsap.set(splitHeading.chars, { yPercent: 0, opacity: 1 });

        requestAnimationFrame(() => {
          if (cancelled) return;
          requestAnimationFrame(() => {
            if (cancelled) return;

            ctx.add(() => {
              scheduleScrollTriggerRefresh();

              const headingTl = gsap.timeline({
                scrollTrigger: {
                  trigger: workSectionsRef.current,
                  // Was "top top" — pin (and the scrub timeline riding
                  // along with it) only engages once the trigger's start
                  // is crossed, so with "top top" the section scrolled
                  // all the way up flush against the navbar, fully
                  // visible and unpinned, before locking/scattering ever
                  // began. Starting at "top 35%" instead means it's still
                  // just scrolling normally (no pin, no scatter) until
                  // its top reaches 35% down the viewport — then it
                  // sticks and the scatter plays out, matching "scroll
                  // until ~top-30/40%, then it sticks and starts
                  // scattering" instead of only sticking once it's
                  // already flush under the navbar.
                  start: "top 35%",
                  // Was 160%/120% — that reserved up to 160vh of pinned
                  // scroll on top of this section's own 100vh, on a
                  // scatter animation that only needs a fraction of that
                  // to read clearly. The rest was dead scroll: the cards
                  // below (and the bg-color swap they carry) didn't
                  // start until the user had scrolled all the way through
                  // that empty pinned gap. Shortened to just enough scroll
                  // for the exit to finish — the cards' own reveal
                  // ScrollTriggers and the dark card's bg-color swap are
                  // untouched, they just arrive sooner now that there's
                  // less empty pin before them.
                  end: () => (window.innerWidth <= 768 ? "+=60%" : "+=70%"),
                  scrub: 1,
                  pin: true,
                },
              });

              headingTl.to(splitHeading.chars, {
                x: (i, _target, targets) => {
                  const center = (targets.length - 1) / 2;
                  return i < center
                    ? gsap.utils.random(-180, -80)
                    : gsap.utils.random(80, 180);
                },
                y: () => gsap.utils.random(-180, 80),
                opacity: 0,
                rotateX: () => gsap.utils.random(-45, 45),
                rotateY: () => gsap.utils.random(-70, 70),
                rotation: () => gsap.utils.random(-20, 20),
                scale: () => gsap.utils.random(0.7, 1),
                stagger: { each: 0.035, from: "center" },
                ease: "power3.out",
                duration: 1.2,
              });

              // ==========================================================
              // BODY BACKGROUND SWAP (triggered by the dark card)
              // ==========================================================
              // Moved inside this same deferred double-rAF block (was
              // created synchronously, right after this whole if-block,
              // outside the defer) — headingTl's own pin above reserves
              // real extra scroll height once its pin-spacer lands
              // (end: "+=70%" of the viewport), which only actually
              // happens once THIS deferred callback runs. Creating
              // bodyTl's ScrollTrigger before that pin-spacer existed
              // measured bgBlackCardRef's "top center" position against
              // a page that was about to grow taller, landing its
              // trigger in the wrong place — reachable "for real" only
              // well past where the user's actual scroll position ended
              // up relative to it, which is what read as this section
              // showing solid black immediately instead of scrubbing
              // in from white. Same double-rAF reasoning
              // AboutPartnerSection.jsx documents for its own deferred
              // measurements: one rAF only guarantees a repaint, not
              // that this page's own earlier pin has finished settling.
              if (bgBlackCardRef.current) {
                const bodyTl = gsap.timeline({
                  scrollTrigger: {
                    trigger: bgBlackCardRef.current,
                    start: "top center",
                    end: "bottom bottom",
                    scrub: 1,
                  },
                });

                bodyTl.to(document.body, { "--bodybg": "#000" }, 0);

                // HeroModelSection.jsx darkens .nav-bar/.menu-dropdown to
                // solid black as its centerTextHero panel comes in (their
                // own resting default is a faint translucent white — see
                // navbar.css). Once this section's dark card flips the
                // page background to black to match, that same dark
                // navbar reads as invisible against it — so this reverses
                // it back to its whitish default in the same scrub, at
                // the same "0" position as the body tween above, so they
                // change together.
                //
                // Same lazy-lookup-with-poll pattern as
                // HeroModelSection.jsx's own navbar tween, and for the
                // same reason: .nav-bar/.menu-dropdown live in a sibling
                // component (Navbar.jsx) that isn't guaranteed to have
                // mounted yet at the exact moment this runs, and GSAP
                // resolves a string/element target once, synchronously,
                // when the tween is added — it won't retry later.
                let navbarAttempts = 0;
                const addNavbarRestoreTween = () => {
                  if (cancelled) return;
                  const navBar = document.querySelector(".nav-bar");
                  const menuDropdown = document.querySelector(".menu-dropdown");
                  if (navBar && menuDropdown) {
                    bodyTl.to(
                      [navBar, menuDropdown],
                      {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        ease: "power2.inOut",
                      },
                      0,
                    );
                    return;
                  }
                  navbarAttempts += 1;
                  if (navbarAttempts < 30)
                    requestAnimationFrame(addNavbarRestoreTween);
                };
                addNavbarRestoreTween();
              }

              scheduleScrollTriggerRefresh();
            });
          });
        });
      }

      scheduleScrollTriggerRefresh();
    }, rootRef);

    return () => {
      cancelled = true; // guards the deferred rAFs above if unmount beats them
      cardRefs.current.forEach((card) => card.__cleanupHover?.());
      ctx.revert(); // kills all tweens/ScrollTriggers created above
      splitHeading?.revert(); // un-wraps the SplitText <div> spans
      gsap.set(document.body, { clearProps: "--bodybg" }); // don't leak black bg to other routes
    };
  }, []);

  return (
    <div ref={rootRef}>
      <section className="work-sections" ref={workSectionsRef}>
        <div className="heading-for-work">
          <div className="tag-head">Work</div>
          <h2 ref={headingRef}>
            Ideas That <span className="highlight">Float</span>
            <br />
            Brands <span className="highlight">Forward</span>
          </h2>
        </div>
      </section>

      <div className="work-section-cards">
        {WORK_ITEMS.map((item) => (
          <PageTransitionLink
            href={item.href}
            className={`card-work-cm${item.isDark ? " bg-black" : ""}`}
            key={item.id}
            ref={(el) => registerCardRef(el, item)}
            aria-label={`View ${item.title} case study`}
          >
            <div className="cta-content">
              {item.tags.map((tag) => (
                <div className="tags-main" key={tag}>
                  {tag}
                </div>
              ))}
              <div className="tags-main tag-name-project">{item.title}</div>
            </div>

            {item.video && (
              <video
                className="card-work-cm__video"
                muted
                loop
                playsInline
                preload="none"
                poster={item.poster}
              >
                <source src={item.video} type="video/mp4" />
              </video>
            )}
            <img
              className="card-work-cm__image"
              src={item.image}
              alt={`${item.title} project preview`}
              loading="lazy"
            />
          </PageTransitionLink>
        ))}
      </div>
    </div>
  );
}
