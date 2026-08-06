"use client";

import { useEffect, useState } from "react";
// import Preloader, { PRELOADER_SKIP_CLASS } from "./PreLoader";
import Preloader1 from "./PreLoader1";

// Old Preloader's skip-class kept as a plain constant here (rather than
// imported from PreLoader.tsx, which is commented out above) so the
// beforeInteractive skip-script below still has something to reference —
// uncomment the PreLoader import above and swap Preloader1 back out to
// restore the old one; this constant's value is unchanged either way.
export const PRELOADER_SKIP_CLASS = "preloader-skip";
export const PRELOADER_SESSION_KEY = "vyrl-preloader-shown";

// Always renders the Preloader — whether it should actually play or be
// skipped this session is decided by a blocking inline script in
// layout.tsx's <head> (see PreloaderSkipScript below), which runs
// before hydration and paint. Deciding this here instead (state set
// from sessionStorage inside useEffect/useState) only takes effect
// AFTER the first paint, so real page content flashes on screen first —
// that's the exact bug this component exists to avoid.
//
// Once the reveal finishes, the whole Preloader unmounts here (rather
// than staying mounted forever with pointer-events: none).
//
// PreLoader1 (the SVG draw/morph loader) doesn't handle scroll-locking,
// the preloader-active class, or the preloader:finish event dispatch
// itself — PreLoader.tsx did all of that internally via its own isInert
// effect. That logic now lives here instead, driven off PreLoader1's
// onComplete, so it still applies regardless of which loader component
// is plugged in below.
export default function PreloaderGate() {
  const [isDone, setIsDone] = useState(false);

  // PreLoader1 (unlike PreLoader.tsx) has no PRELOADER_SKIP_CLASS
  // awareness of its own — it always plays its full ~4s intro if
  // mounted. Reading the class here (safe: this component only ever
  // renders client-side, after the beforeInteractive skip-script in
  // layout.tsx's <head> has already run and stamped it, so there's no
  // SSR/hydration mismatch to worry about) lets the gate skip mounting
  // Preloader1 at all on a repeat visit, instead of relying on the
  // child to self-skip.
  const [skipped] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains(PRELOADER_SKIP_CLASS),
  );

  // Same scroll-lock behavior PreLoader.tsx used to own internally: lock
  // scroll (and reset to top) for as long as the preloader is actually
  // going to play, but skip the lock entirely on repeat page loads this
  // session since those replays are invisible and shouldn't block
  // scrolling.
  useEffect(() => {
    if (isDone || skipped) {
      document.documentElement.classList.remove("preloader-active");
      document.body.classList.remove("preloader-active");
      return;
    }

    window.scrollTo(0, 0);
    document.documentElement.classList.add("preloader-active");
    document.body.classList.add("preloader-active");
    return () => {
      document.documentElement.classList.remove("preloader-active");
      document.body.classList.remove("preloader-active");
    };
  }, [isDone, skipped]);

  if (isDone || skipped) return null;

  return (
    <Preloader1
      onComplete={() => {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
        setIsDone(true);

        // Every section mounted underneath while the preloader covered the
        // screen, so their ScrollTrigger/Lenis measurements were taken
        // against a DOM that was still settling (images/fonts loading,
        // layout shifting under the fixed overlay). SmoothScroll only ever
        // re-measures on pathname change, so on first load nothing corrects
        // those stale values until the user's first scroll forces a reflow
        // — which is what showed up as a tiny/broken navbar and a frozen
        // page until scrolling into the second section.
        window.dispatchEvent(new Event("preloader:finish"));
      }}
    />
  );

  // return (
  //   <Preloader
  //     onFinish={() => {
  //       sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
  //       setIsDone(true);
  //       window.dispatchEvent(new Event("preloader:finish"));
  //     }}
  //   />
  // );
}

// Rendered as a <script> in the document <head> via dangerouslySetInnerHTML
// (see layout.tsx) — runs synchronously before anything paints. If this
// session already saw the preloader, it stamps a class on <html> that
// globals.css uses to hide the preloader instantly with no transition
// and no flash, in either direction.
export const preloaderSkipScript = `
(function() {
  try {
    if (sessionStorage.getItem('${PRELOADER_SESSION_KEY}')) {
      document.documentElement.classList.add('${PRELOADER_SKIP_CLASS}');
    }
  } catch (e) {}
})();
`;
