"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { revealTransition } from "./pageTransition";

// Fixed, full-viewport grid of blocks that wipes the screen on route
// changes — ported from a plain HTML/CSS/JS reference (5x2 grid,
// row-1 blocks scale from their top edge, row-2 blocks scale from
// their bottom edge, GSAP stagger animates each block's scaleY).
// Mounted once in app/layout.tsx so it persists across every route
// (a per-page overlay would unmount/remount on navigation, which is
// exactly the DOM it needs to survive across to cover the swap).
//
// Replaces the previous next-view-transitions-based mechanism
// (ViewTransitions + native document.startViewTransition(), see the
// old slideInOut in pageTransition.js) — this version animates real
// DOM nodes directly with GSAP instead of relying on the View
// Transitions API, so it works identically in every browser without
// depending on that API's availability.
//
// The wipe-in half (animateTransition, blocks growing to cover the
// screen) is triggered by the outgoing page's own click handler
// (PageTransitionLink.tsx, Navbar.jsx, ProjectsGrid.jsx) right before
// router.push. This component owns the other half: revealing the
// grid again (scaling back down) once the NEW route has actually
// mounted, since this overlay lives outside the routed page tree in
// layout.tsx and never itself unmounts/remounts on navigation the way
// the reference's single-page version did.
//
// Nothing runs on the very first mount (real page load, not a client
// navigation) — the grid's own resting CSS state is already hidden
// (see page-transition.css), and this app's separate first-load
// preloader (PreloaderGate.tsx) owns revealing the very first page.
// Only pathname changes AFTER that first mount are client-side route
// changes, where this is what reveals the new page from behind
// whatever wipe animateTransition() played.
export default function PageTransitionOverlay() {
  const pathname = usePathname();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    revealTransition();
  }, [pathname]);

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
