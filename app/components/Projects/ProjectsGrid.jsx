"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FILTERS = [
  { label: "ALL", value: "all" },
  { label: "BRANDING", value: "branding" },
  { label: "WEBSITES", value: "website" },
];

// Row-grouped so the "stretched" single-card row renders exactly like the
// original markup (two cards / one full-width card / two cards).
const PROJECT_ROWS = [
  [
    {
      id: "prime-estates-1",
      title: "PRIME ESTATES",
      category: "branding",
      type: "image",
      src: "/pro1.png",
      tags: ["Strategic Roadmaps", "Strategic Roadmaps"],
    },
    {
      id: "slab-studio",
      title: "SLAB STUDIO",
      category: "website",
      type: "video",
      src: "/video03.mp4",
      tags: ["Strategic Roadmaps", "Strategic Roadmaps"],
    },
  ],
  [
    {
      id: "prime-estates-2",
      title: "PRIME ESTATES",
      category: "website",
      type: "image",
      src: "/pro1.png",
      stretch: true,
      tags: ["Strategic Roadmaps", "Strategic Roadmaps"],
    },
  ],
  [
    {
      id: "arabian-estates",
      title: "ARABIAN ESTATES",
      category: "branding",
      type: "image",
      src: "/pro1.png",
      tags: ["Strategic Roadmaps", "Strategic Roadmaps"],
    },
    {
      id: "lala-darbar",
      title: "LALA DARBAR",
      category: "website",
      type: "image",
      src: "/pro1.png",
      tags: ["Strategic Roadmaps", "Strategic Roadmaps"],
    },
  ],
];

export default function ProjectsGrid() {
  const sectionRef = useRef(null);
  const cardRefs = useRef(new Map()); // id -> card DOM node
  const followerRefs = useRef(new Map()); // id -> follower DOM node
  const quickToRefs = useRef(new Map()); // id -> { xTo, yTo }
  const [activeFilter, setActiveFilter] = useState("all");

  const setCardRef = (id) => (node) => {
    if (node) cardRefs.current.set(id, node);
    else cardRefs.current.delete(id);
  };

  const setFollowerRef = (id) => (node) => {
    if (node) followerRefs.current.set(id, node);
    else followerRefs.current.delete(id);
  };

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

    return () => ctx.revert();
  }, []);

  // --- Filter: re-run whenever the active category changes --------------
  useLayoutEffect(() => {
    cardRefs.current.forEach((card, id) => {
      const project = PROJECT_ROWS.flat().find((p) => p.id === id);
      if (!project) return;

      const isVisible =
        activeFilter === "all" || project.category === activeFilter;

      gsap.to(card, {
        opacity: isVisible ? 1 : 0.2,
        scale: isVisible ? 1 : 0.88,
        filter: isVisible ? "brightness(1)" : "brightness(0.3)",
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });

      card.style.pointerEvents = isVisible ? "auto" : "none";
      card.style.cursor = isVisible ? "pointer" : "default";
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
        <div className="centerHeadingProject">PROJECTS</div>
      </div>

      <div className="cardsSection">
        {PROJECT_ROWS.map((row, rowIndex) => (
          <div className="seprateDivs" key={`row-${rowIndex}`}>
            {row.map((project) => (
              <div
                key={project.id}
                ref={setCardRef(project.id)}
                className={`cardsProject ${project.stretch ? "cardStrech" : ""}`}
                data-category={project.category}
                onMouseMove={handleMouseMove(project.id)}
                onMouseEnter={handleMouseEnter(project.id)}
                onMouseLeave={handleMouseLeave(project.id)}
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
        ))}
      </div>
    </div>
  );
}

function ProjectMedia({ project }) {
  if (project.type === "video") {
    return (
      <video muted loop autoPlay playsInline>
        <source src={project.src} />
      </video>
    );
  }
  return <img src={project.src} alt={project.title} loading="lazy" />;
}
