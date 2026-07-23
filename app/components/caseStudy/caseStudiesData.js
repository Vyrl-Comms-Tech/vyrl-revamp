// Shared case-study content, keyed by slug (matches the route, e.g. /sanamcars).
// CaseStudyInner reads its own entry via `slug` and looks up `next` for the
// panel-8 "next project" teaser — add a new case here and it's wired in.

export const caseStudies = {
  "lala-darbar": {
    slug: "lala-darbar",
    href: "/lala-darbar",
    title: "Lala Darbar",
    duration: "6 weeks",
    services: ["Visual identity refresh: new typography, color expansion, and design language", "Website built in React with custom GSAP animations", "Horizontal scroll with pinned content sections—a technically demanding structure that enables a fluid, cinematic experience", "One-of-a-kind section transitions with scroll-based storytelling", "Menu UI with illustrated flavor filters and hover-based dish previews"],
    images: [
      "/lala4.avif",
      "/lala2.avif",
      "/lala1.avif",
      "/lala5.avif",
      "/lala3.avif",
    ],
    panel8Image: "/lala1.avif",
    infoHeading: "About the Company",
    description:
      " Lala Darbar is a bold, unapologetically Pakistani restaurant in Dubai known for its truck-art aesthetic, nostalgic desi comfort food, and celebrity-powered buzz. The brand brings the chaos and charm of South Asia’s street culture into an elevated dining experience",
    creditsTitle: "Client Testimonial",
    creditsText:
      "It’s more than a website—it’s a whole mood. Vyrl turned our energy into something you can actually feel online. The scrolling, the transitions, the experience—just next level.",
    next: "sanam-cars",
  },
  "sanam-cars": {
    slug: "sanam-cars",
    href: "/sanamcars",
    title: "Sanam Cars",
    duration: "4 weeks",
    services: ["Development", "UIUX", "Branding"],
    images: [
      "/sanam3.avif",
      "/sanam2.avif",
      "/sanam1.avif",
      "/sanam5.avif",
      "/sanam4.avif",
    ],
    panel8Image: "/sanam5.avif",
    infoHeading: "information",
    description:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    creditsTitle: "Credits",
    creditsText:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    next: "arabian-estate",
  },
  "arabian-estate": {
    slug: "arabian-estate",
    href: "/arabian-estate",
    title: "Arabian Estates",
    duration: "6 weeks",
    services: ["Development", "UIUX", "Branding"],
    images: [
      "/arab1.avif",
      "/arab6.avif",
      "/arab5.avif",
      "/arab2.avif",
      "/arab4.avif",
    ],
    panel8Image: "/arab3.avif",
    infoHeading: "information",
    description:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    creditsTitle: "Credits",
    creditsText:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    next: "jeikor",
  },
  jeikor: {
    slug: "jeikor",
    href: "/jeikor",
    title: "Jeikor",
    duration: "3.5 weeks",
    services: ["Fully responsive site built with React", "GSAP-driven hero animation and section transitions", "Modular layout system for future scalability", "Chairman’s message and group companies rendered as interactive blocks", "Optimized for bilingual expansion (EN/AR)"],
    images: [
      "/jeikor4.avif",
      "/jeikor.avif",
      "/jeikor2.avif",
      "/jeikor3.avif",
      "/jeikor5.avif",
    ],
    panel8Image: "/jeikor3.avif",
    infoHeading: "About the Company",
    description:
      "Jeikor Contracting is a Dubai-based construction and infrastructure firm specializing in residential, commercial, and government projects. Known for its commitment to quality, safety, and timely delivery, Jeikor operates under a group umbrella alongside several sister companies in engineering and real estate",
    creditsTitle: "Client Testimonial",
    creditsText:
      "We finally have a digital presence that reflects the scale and seriousness of our work. Vyrl delivered exactly what we needed — with clarity, speed, and finesse.",
    next: "banda",
  },
  banda: {
    slug: "banda",
    href: "/banda",
    title: "Banda",
    duration: "8 weeks",
    services: ["Strong visual consistency across investor touchpoints post-launch", "Significant improvement in site engagement and time-on-page", "Brand and website praised by industry peers and partners for originality and execution"],
    images: [
      "/banda4.avif",
      "/banda2.avif",
      "/banda3.avif",
      "/banda1.avif",
      "/banda5.avif",
    ],
    panel8Image: "/banda1.avif",
    infoHeading: "About the Company",
    description:
      " Banda is a luxury real estate investment and development firm inspired by East African heritage and a deep appreciation for architectural artistry. With a commitment to timeless design, cultural narrative, and curated living spaces, Banda builds properties that resonate on an emotional level.",
    creditsTitle: "Client Testimonial",
    creditsText:
      "Vyrl brought our brand to life exactly how we imagined—refined, artistic, and deeply rooted in our values. The identity and website feel like an extension of who we are.",
    next: "lala-darbar",
  },
};

export const getCaseStudy = (slug) => caseStudies[slug];

export const getNextCaseStudy = (slug) => {
  const current = caseStudies[slug];
  if (!current) return null;
  return caseStudies[current.next] ?? null;
};
