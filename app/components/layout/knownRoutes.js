import { caseStudies } from "../caseStudy/caseStudiesData";

// Every real route the site actually serves — used to detect "this is
// the 404 page" from usePathname() alone. Next.js resolves an unmatched
// URL by rendering not-found.jsx in place, but usePathname() still
// reports whatever the visitor actually typed (e.g. "/asdf"), not some
// fixed "/_not-found" string — so route-based checks (Navbar/Footer
// hiding themselves on 404) have to compare against a real known-route
// list instead of a single fixed pathname.
export const KNOWN_ROUTES = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/contact-us",
  "/blogs",
  "/blog-inner",
  "/privacy-policy",
  "/terms-and-condition",
  ...Object.values(caseStudies).map((c) => c.href),
];

export const isKnownRoute = (pathname) => KNOWN_ROUTES.includes(pathname);
