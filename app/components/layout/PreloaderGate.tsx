"use client";

import { useState } from "react";
import Preloader from "./PreLoader";

export const PRELOADER_SESSION_KEY = "vyrl-preloader-shown";
export const PRELOADER_SKIP_CLASS = "preloader-skip";

// Always renders the Preloader — whether it should actually play or be
// skipped this session is decided by a blocking inline script in
// layout.tsx's <head> (see PreloaderSkipScript below), which runs
// before hydration and paint. Deciding this here instead (state set
// from sessionStorage inside useEffect/useState) only takes effect
// AFTER the first paint, so real page content flashes on screen first —
// that's the exact bug this component exists to avoid.
//
// Once the dissolve reveal finishes, the whole Preloader unmounts here
// (rather than staying mounted forever with pointer-events: none) — its
// shader canvas keeps its render loop running indefinitely otherwise,
// and the shader's own fragment logic paints solid black wherever
// neither the dissolve edge nor noise strength is lit up, which is what
// showed as a permanent black rectangle covering the page instead of
// the real hero section underneath.
export default function PreloaderGate() {
  const [isDone, setIsDone] = useState(false);

  if (isDone) return null;

  return (
    <Preloader
      onFinish={() => {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
        setIsDone(true);
      }}
    />
  );
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
