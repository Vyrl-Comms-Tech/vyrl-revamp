"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTransitionRouter } from "next-view-transitions";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { slideInOut } from "../layout/pageTransition";
import "../../styles/projects-grid.css";

gsap.registerPlugin(ScrollTrigger, Flip);

const FILTERS = [
  { label: "ALL", value: "all" },
  { label: "REAL ESTATE", value: "real-estate" },
  { label: "RESTAURANT", value: "restaurant" },
  { label: "AUTOMOTIVE", value: "automotive" },
];

// Flat list (not row-grouped) so the Flip filter below can reorder any
// card to any position across the whole grid — each card's own width
// (46.09vw, or 94.5vw for `stretch`) plus flex-wrap on the container
// reproduces the original two-up / full-width / two-up layout without
// needing separate row wrappers.
const PROJECTS = [
  {
    id: "banda",
    title: "BANDA",
    category: "real-estate",
    type: "video",
    src: "/banda -v_compressed.mp4",
    poster: "/banda -v_compressed.avif",
    href: "/banda",
    tags: ["Property Developer", "Luxury Homes"],
  },
  {
    id: "lala-darbar",
    title: "LALA DARBAR",
    category: "restaurant",
    type: "image",
    src: "/lala1.avif",
    href: "/lala-darbar",
    tags: ["Traditional Cuisine", "Fine Dining"],
  },
  {
    id: "arabian-estate",
    title: "ARABIAN ESTATE",
    category: "real-estate",
    type: "image",
    src: "/arab3.avif",
    stretch: true,
    href: "/arabian-estate",
    tags: ["Property Developer", "Residential & Commercial"],
  },
  {
    id: "jeikor",
    title: "JEIKOR",
    category: "real-estate",
    type: "image",
    src: "/jeikor4.avif",
    href: "/jeikor",
    tags: ["Property Developer", "Urban Living"],
  },
  {
    id: "sanam-cars",
    title: "SANAM CARS",
    category: "automotive",
    type: "video",
    src: "/sanam-v_compressed.mp4",
    poster: "/sanam-v_compressed.avif",
    href: "/sanamcars",
    tags: ["Car Dealership", "Premium Vehicles"],
  },
];
const FILTER_VALUES = FILTERS.map((f) => f.value);

export default function ProjectsGrid() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const sectionRef = useRef(null);
  const cardRefs = useRef(new Map()); // id -> card DOM node
  const followerRefs = useRef(new Map()); // id -> follower DOM node
  const quickToRefs = useRef(new Map()); // id -> { xTo, yTo }
  const categoryParam = searchParams.get("category");
  const categoryFromUrl =
    categoryParam && FILTER_VALUES.includes(categoryParam)
      ? categoryParam
      : "all";

  // Lets links elsewhere on the site (e.g. the navbar's category cards)
  // deep-link straight into a pre-selected filter via ?category=restaurant
  // etc. — but the in-page filter buttons below can also change this
  // independently of the URL, so it can't be purely derived from
  // searchParams on every render either.
  //
  // Clicking a navbar category card while ALREADY on /projects doesn't
  // remount this component (same route, just a different query string),
  // so a useState initializer alone only ever picks up categoryFromUrl
  // once, on first mount — later clicks played a pointless
  // view-transition with nothing visibly changing underneath, which read
  // as a glitch. Comparing against the last-seen URL value during
  // render (React's documented pattern for "reset state when a prop
  // changes" without needing a key remount) re-syncs activeFilter
  // exactly when the URL itself changes, while still leaving room for
  // the filter buttons to set it independently in between.
  const [activeFilter, setActiveFilter] = useState(categoryFromUrl);
  const [lastCategoryFromUrl, setLastCategoryFromUrl] =
    useState(categoryFromUrl);
  if (categoryFromUrl !== lastCategoryFromUrl) {
    setLastCategoryFromUrl(categoryFromUrl);
    setActiveFilter(categoryFromUrl);
  }

  const setCardRef = (id) => (node) => {
    if (node) cardRefs.current.set(id, node);
    else cardRefs.current.delete(id);
  };

  const setFollowerRef = (id) => (node) => {
    if (node) followerRefs.current.set(id, node);
    else followerRefs.current.delete(id);
  };

  // --- Viewport play/pause: only decode/play video when its card is visible ---
  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videos = entry.target.querySelectorAll("video");
          videos.forEach((video) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        });
      },
      { threshold: 0.1 },
    );

    cardRefs.current.forEach((card, id) => {
      const project = PROJECTS.find((p) => p.id === id);
      if (project?.type === "video") observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  // --- Mount: cursor-follow quickTo setup + scroll-reveal ---------------
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, id) => {
        const follower = followerRefs.current.get(id);
        if (!follower) return;

        gsap.set(follower, { xPercent: -50, yPercent: -50 });

        quickToRefs.current.set(id, {
          xTo: gsap.quickTo(follower, "x", {
            duration: 0.25,
            ease: "power3.out",
          }),
          yTo: gsap.quickTo(follower, "y", {
            duration: 0.25,
            ease: "power3.out",
          }),
        });

        gsap.from(card, {
          y: 120,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: card,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        });
      });
    }, sectionRef);

    // Each card's ScrollTrigger caches its "top 75%" start position
    // against whatever the DOM layout is at the moment it's created.
    // Card heights here are responsive (clamp()-based, changing per
    // breakpoint), and media/fonts can still be loading in — if that
    // settles after this effect runs, the cached trigger points go
    // stale relative to the final layout. That let cards (especially
    // the last row, e.g. JEIKOR/SANAM CARS) fire late or land mid-
    // animation, reading as overlapping the section below instead of
    // cleanly finishing before it. Refreshing on the next frame
    // recalculates every trigger against the settled layout.
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshId);
      ctx.revert();
    };
  }, []);

  // --- Filter: re-run whenever the active category changes --------------
  // Matching cards flip to the front of the grid and reflow into place
  // (via Flip.getState -> mutate order/opacity -> Flip.from) instead of
  // just fading in place, same pattern as BlogCards.jsx's filter.
  useLayoutEffect(() => {
    const cardEls = gsap.utils.toArray(".cardsProject", sectionRef.current);
    if (!cardEls.length) return;

    gsap.killTweensOf(cardEls);

    const cardIsActive = (card) =>
      activeFilter === "all" || card.dataset.category === activeFilter;

    // Regular (non-stretch) active cards go first so they pair up two
    // to a row; the stretch (full-width) card is placed after the
    // first pair so it always lands in its own row rather than
    // possibly ending up as the lone card in a row by itself (which
    // pushed a regular card into that slot instead and read as a
    // stray centered card — the reported glitch). Was previously a
    // single flat "-1" for every active card, which left cards in
    // their original DOM order (regular, stretch, regular) instead
    // of this regular/regular/stretch shape.
    const activeRegular = cardEls.filter(
      (c) => cardIsActive(c) && !c.classList.contains("cardStrech"),
    );
    const activeStretch = cardEls.filter(
      (c) => cardIsActive(c) && c.classList.contains("cardStrech"),
    );
    const inactiveCards = cardEls.filter((c) => !cardIsActive(c));

    const orderedActive = [
      ...activeRegular.slice(0, 2),
      ...activeStretch,
      ...activeRegular.slice(2),
    ];
    const sortedEls = [...orderedActive, ...inactiveCards];

    const state = Flip.getState(sortedEls, { props: "opacity" });

    const orderMap = new Map(orderedActive.map((card, i) => [card, i]));

    cardEls.forEach((card) => {
      const isVisible = cardIsActive(card);
      card.style.order =
        activeFilter === "all" ? "0" : isVisible ? String(orderMap.get(card)) : "999";
      card.style.opacity = isVisible ? "1" : "0.3";
      card.style.pointerEvents = isVisible ? "auto" : "none";
      card.style.cursor = isVisible ? "pointer" : "default";
    });

    Flip.from(state, {
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.05,
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [activeFilter]);

  const handleMouseMove = (id) => (e) => {
    const handlers = quickToRefs.current.get(id);
    if (!handlers) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handlers.xTo(e.clientX - rect.left);
    handlers.yTo(e.clientY - rect.top);
  };

  const handleMouseEnter = (id) => () => {
    const follower = followerRefs.current.get(id);
    if (follower) gsap.to(follower, { scale: 1, duration: 0.2 });
  };

  const handleMouseLeave = (id) => () => {
    const follower = followerRefs.current.get(id);
    if (follower) gsap.to(follower, { scale: 0, duration: 0.2 });
  };

  const handleCardClick = (project) => () => {
    if (project.href) {
      router.push(project.href, { onTransitionReady: slideInOut });
    }
  };

  return (
    <div className="projectContainer" ref={sectionRef}>
      <div className="heroProject">
        <div className="filterCtas">
          <h1>FILTER</h1>
          <div className="ctaFilter">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`ctaF ${activeFilter === filter.value ? "ctaActive" : ""}`}
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="centerHeadingProject">
          <span className="pc-mini-head">Case Studies</span>
          <h1 className="pc-bigger-head">And Digital Insights</h1>
          <p className="pc-para">
             A closer look at the work we build, the ideas we believe in, and
            the digital strategies helping ambitious brands grow smarter.
          </p>
        </div>
      </div>

      <div className="cardsSection">
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            ref={setCardRef(project.id)}
            className={`cardsProject ${project.stretch ? "cardStrech" : ""}`}
            data-category={project.category}
            onMouseMove={handleMouseMove(project.id)}
            onMouseEnter={handleMouseEnter(project.id)}
            onMouseLeave={handleMouseLeave(project.id)}
            onClick={handleCardClick(project)}
          >
            <div className="imageBgContainer">
              <ProjectMedia project={project} />
            </div>

            <div className="imgFollow" ref={setFollowerRef(project.id)}>
              <ProjectMedia project={project} />
            </div>

            <div className="contentProject">
              <h1>{project.title}</h1>
              <div className="tagsProject">
                {project.tags.map((tag, i) => (
                  <div className="tagP" key={`${project.id}-tag-${i}`}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectMedia({ project }) {
  if (project.type === "video") {
    return (
      <video muted loop playsInline preload="metadata" poster={project.poster}>
        <source src={project.src} />
      </video>
    );
  }
  return (
    <Image
      src={project.src}
      alt={project.title}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
