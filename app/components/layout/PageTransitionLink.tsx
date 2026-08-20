"use client";
import { forwardRef, MouseEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { animateTransition, isCaseStudyPath, killAllPins } from "./pageTransition";

type PageTransitionLinkProps = React.ComponentProps<typeof Link>;

// Drop-in replacement for next/link that plays the site-wide block-grid
// wipe transition on click (see Navbar.jsx's NavLink for the original
// version of this pattern) — for links outside the navbar: footer links,
// CtaButton, and ProjectsGrid's card clicks into a case study.
//
// Plain next/link + next/navigation's useRouter now (not
// next-view-transitions' Link/useTransitionRouter) — the transition
// itself is driven directly by GSAP animating the block grid mounted in
// layout.tsx (see PageTransitionOverlay.jsx/pageTransition.js), not the
// native View Transitions API, so there's no more need for that
// library's router wrapper.
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
      // (heading clone + overlay, timed against a plain router.push —
      // see CaseStudyInner.jsx/ProjectsGrid.jsx), so layering the block
      // wipe on top of that would fight it. Leaving a case-study page is
      // fine to use this transition now that CaseStudyInner guards its
      // own ScrollTrigger callbacks against firing again once it starts
      // unmounting (isUnmountingRef) — that guard, not this exclusion,
      // is what actually fixed the earlier bug where a stray onUpdate
      // tick could snap the route back to the next case study right
      // after leaving one.
      if (isCaseStudyPath(hrefStr)) return;

      // pathname (from usePathname()) never includes the query string,
      // so e.g. "/projects?category=restaurant" === "/projects" is
      // always false even when already on that exact page — the navbar's
      // category cards (?category=real-estate etc.) kept firing the full
      // wipe transition on every click, animating a "new" page in over
      // the one already showing, with nothing actually changing
      // underneath since it's the same route. Comparing just the path
      // portion (stripping the query) catches that case and does a
      // plain query-only navigation with no transition instead.
      e.preventDefault();
      const hrefPath = hrefStr.split("?")[0].split("#")[0];
      if (hrefPath === pathname) {
        router.push(hrefStr);
        return;
      }

      // killAllPins() must run AFTER the blocks have fully covered the
      // screen, not before: killing a pin (e.g. OrbitGallery's own
      // pinned .image-orbit, which drives its footer's translateY
      // reveal) un-pins that section instantly and synchronously,
      // snapping the page's layout back to normal flow right then —
      // visibly, since animateTransition() below still takes ~1s to
      // actually finish covering the screen. Under the old
      // next-view-transitions mechanism this order was fine because
      // startViewTransition() took an instant synchronous DOM snapshot,
      // so that reflow was already baked into the "old page" frame
      // before anything animated; this GSAP version has no such
      // snapshot, so the reflow was happening live, visible, for the
      // better part of a second before the blocks caught up to hide it
      // — which is what showed up as OrbitGallery's cards/orbit
      // briefly flashing through mid-wipe. Waiting for the wipe to
      // finish first means nothing visible reflows until it's already
      // hidden behind solid black.
      animateTransition(hrefStr).then(() => {
        killAllPins();
        router.push(hrefStr);
      });
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
