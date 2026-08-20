"use client";
import { forwardRef, MouseEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { triggerNavigation, isCaseStudyPath } from "./pageTransition";

type PageTransitionLinkProps = React.ComponentProps<typeof Link>;

// Drop-in replacement for next/link that plays the site-wide block-grid
// wipe, then does a REAL hard navigation (window.location.href, see
// pageTransition.js's triggerNavigation()) — not a Next.js client-side
// router.push(). See pageTransition.js's own top-of-file comment for why:
// this matches the old (pre-App-Router) site's PageTransition.jsx on
// purpose, trading SPA-speed navigation for a guaranteed clean slate on
// every route (no more cross-page GSAP/ScrollTrigger/document.body state
// leaking, since a hard reload tears all of that down for free).
//
// Used for links outside the navbar: footer links, CtaButton, and
// ProjectsGrid's card clicks into a case study.
const PageTransitionLink = forwardRef<HTMLAnchorElement, PageTransitionLinkProps>(
  ({ href, children, onClick, ...rest }, ref) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      const hrefStr = href.toString();
      if (hrefStr === "#" || hrefStr === pathname) return;

      // Entering a case-study page runs its own hand-built transition
      // (heading clone + overlay, timed against its own client-side
      // router.push — see CaseStudyInner.jsx/ProjectsGrid.jsx), which is
      // unchanged and still SPA-based. Layering this hard-nav wipe on top
      // of that would fight it (and defeat the whole point of that
      // transition's own DOM-persisting heading-fly effect), so entering
      // a case study is excluded here and left as a plain Link navigation
      // — CaseStudyInner's own click handling on ProjectsGrid's cards
      // takes it from there.
      if (isCaseStudyPath(hrefStr)) return;

      // pathname (from usePathname()) never includes the query string,
      // so e.g. "/projects?category=restaurant" === "/projects" is
      // always false even when already on that exact page — the navbar's
      // category cards (?category=real-estate etc.) kept firing the full
      // wipe transition on every click, animating a "new" page in over
      // the one already showing, with nothing actually changing
      // underneath since it's the same route. Comparing just the path
      // portion (stripping the query) catches that case and does a
      // plain query-only client-side navigation with no wipe/reload
      // instead — a hard reload here would be needlessly disruptive for
      // what's just a filter change on the same page.
      e.preventDefault();
      const hrefPath = hrefStr.split("?")[0].split("#")[0];
      if (hrefPath === pathname) {
        router.push(hrefStr);
        return;
      }

      triggerNavigation(hrefStr);
    };

    return (
      <Link href={href} ref={ref} onClick={handleClick} {...rest}>
        {children}
      </Link>
    );
  },
);

PageTransitionLink.displayName = "PageTransitionLink";

export default PageTransitionLink;
