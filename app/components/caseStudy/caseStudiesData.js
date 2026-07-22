// Shared case-study content, keyed by slug (matches the route, e.g. /sanamcars).
// CaseStudyInner reads its own entry via `slug` and looks up `next` for the
// panel-8 "next project" teaser — add a new case here and it's wired in.

export const caseStudies = {
  "lala-darbar": {
    slug: "lala-darbar",
    href: "/lala-darbar",
    title: "Lala Darbar",
    services: ["Development", "UIUX", "Branding"],
    images: [
      "/lala4.avif",
      "/lala2.avif",
      "/lala1.avif",
      "/lala5.avif",
      "/lala3.avif",
    ],
    panel8Image: "/lala1.avif",
    infoHeading: "information",
    description:
      "Lala Darbar Traditional Food Restaurant is a well-known dining spot that specializes in authentic, home-style cuisine, offering customers a rich taste of traditional flavors in a comfortable and culturally inspired setting. The restaurant has built its reputation on maintaining high-quality ingredients, consistent taste, and a menu that reflects local culinary heritage.",
    creditsTitle: "Credits",
    creditsText:
      "Lala Darbar Traditional Food Restaurant is a well-known dining spot that specializes in authentic, home-style cuisine, offering customers a rich taste of traditional flavors in a comfortable and culturally inspired setting. The restaurant has built its reputation on maintaining high-quality ingredients, consistent taste, and a menu that reflects local culinary heritage.",
    next: "sanam-cars",
  },
  "sanam-cars": {
    slug: "sanam-cars",
    href: "/sanamcars",
    title: "Sanam Cars",
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
  "jeikor": {
    slug: "jeikor",
    href: "/jeikor",
    title: "Jeikor",
    services: ["Development", "UIUX", "Branding"],
    images: [
      "/jeikor4.avif",
      "/jeikor.avif",
      "/jeikor2.avif",
      "/jeikor3.avif",
      "/jeikor5.avif",
    ],
    panel8Image: "/jeikor3.avif",
    infoHeading: "information",
    description:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    creditsTitle: "Credits",
    creditsText:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    next: "banda",
  },
  "banda": {
    slug: "banda",
    href: "/banda",
    title: "Banda",
    services: ["Development", "UIUX", "Branding"],
    images: [
      "/banda4.avif",
      "/banda2.avif",
      "/banda3.avif",
      "/banda1.avif",
      "/banda5.avif",
    ],
    panel8Image: "/banda1.avif",
    infoHeading: "information",
    description:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    creditsTitle: "Credits",
    creditsText:
      "Sanam Cars is a premium car dealership offering a curated selection of new and pre-owned vehicles, backed by transparent pricing and a customer-first buying experience. The brand is known for pairing modern showroom experiences with knowledgeable, no-pressure sales guidance.",
    next: "lala-darbar",
  },
};

export const getCaseStudy = (slug) => caseStudies[slug];

export const getNextCaseStudy = (slug) => {
  const current = caseStudies[slug];
  if (!current) return null;
  return caseStudies[current.next] ?? null;
};
