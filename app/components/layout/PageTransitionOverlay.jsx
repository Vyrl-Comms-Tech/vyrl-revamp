"use client";

import { useEffect } from "react";
import { revealTransitionIfPending } from "./pageTransition";

// Fixed, full-viewport grid of blocks that wipes the screen during
// navigation — ported from a plain HTML/CSS/JS reference (5x2 grid,
// row-1 blocks scale from their top edge, row-2 blocks scale from their
// bottom edge, GSAP stagger animates each block's scaleY). Mounted once in
// app/layout.tsx.
//
// Navigation itself is now a real, hard browser navigation
// (window.location.href — see pageTransition.js's triggerNavigation()),
// matching the old (pre-App-Router) site's PageTransition.jsx: every click
// covers the screen, then does a genuine full-page reload, rather than a
// Next.js client-side router.push(). That means this component's own DOM
// is destroyed and recreated fresh on every single navigation along with
// the rest of the page — there is no persistent SPA shell for it to react
// to a pathname change within. Its only job now is: on mount (i.e. on
// every page load), check whether the PREVIOUS page left a "still covering,
// please reveal me" flag in sessionStorage (survives the hard reload,
// unlike any JS variable) and if so, play the reveal half of the wipe.
// revealTransitionIfPending() itself is the no-op when that flag isn't set
// (direct load, external link, browser back/forward, or the very first
// visit — which this app's separate PreloaderGate/Preloader1 already owns
// revealing instead).
export default function PageTransitionOverlay() {
  useEffect(() => {
    revealTransitionIfPending();
  }, []);

  const row1 = [0, 1, 2, 3, 4];
  const row2 = [0, 1, 2, 3, 4];

  return (
    <div className="page-transition" aria-hidden="true">
      <div className="page-transition-row page-transition-row--1">
        {row1.map((i) => (
          <div key={`r1-${i}`} className="page-transition-block" />
        ))}
      </div>
      <div className="page-transition-row page-transition-row--2">
        {row2.map((i) => (
          <div key={`r2-${i}`} className="page-transition-block" />
        ))}
      </div>
    </div>
  );
}
