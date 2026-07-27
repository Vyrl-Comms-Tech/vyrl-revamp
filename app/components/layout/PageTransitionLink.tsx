"use client";
import { forwardRef, MouseEvent } from "react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { slideInOut, isCaseStudyPath } from "./pageTransition";

type PageTransitionLinkProps = React.ComponentProps<typeof Link>;

// Drop-in replacement for next/link that plays the site-wide slideInOut
// view transition on click (see Navbar.jsx's NavLink for the original
// version of this pattern) — for links outside the navbar: footer links,
// CtaButton, and ProjectsGrid's card clicks into a case study.
const PageTransitionLink = forwardRef<HTMLAnchorElement, PageTransitionLinkProps>(
  ({ href, children, onClick, ...rest }, ref) => {
    const router = useTransitionRouter();
    const pathname = usePathname();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      const hrefStr = href.toString();
      if (hrefStr === "#" || hrefStr === pathname) return;

      // Entering a case-study page runs its own hand-built transition
      // (heading clone + overlay, timed against a plain router.push —
      // see CaseStudyInner.jsx/ProjectsGrid.jsx), so layering this
      // view-transition on top of that would fight it. Leaving a
      // case-study page is fine to use this transition now that
      // CaseStudyInner guards its own ScrollTrigger callbacks against
      // firing again once it starts unmounting (isUnmountingRef) — that
      // guard, not this exclusion, is what actually fixed the earlier
      // bug where a stray onUpdate tick could snap the route back to
      // the next case study right after leaving one.
      if (isCaseStudyPath(hrefStr)) return;

      e.preventDefault();
      router.push(hrefStr, { onTransitionReady: slideInOut });
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
