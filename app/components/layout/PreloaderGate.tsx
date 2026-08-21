"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
// import Preloader, { PRELOADER_SKIP_CLASS } from "./PreLoader";
import Preloader1 from "./PreLoader1";
import { warmUpServices3d } from "@/app/lib/services3dRenderer";

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

  // Keep the server and first client render identical, then check browser
  // storage after hydration. This avoids placing an inline <Script> in the
  // root layout, which React 19 rejects during client-side route rendering.
  const skipped = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return Boolean(sessionStorage.getItem(PRELOADER_SESSION_KEY));
      } catch {
        return false;
      }
    },
    () => false,
  );

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

  // Warm up the services cube (GLB fetch/parse/Draco-decode + a hidden
  // shader compile on the shared offscreen renderer, see
  // services3dRenderer.js) while the preloader's own intro is playing
  // anyway, so it's ready by the time Services3d actually mounts. This
  // used to run inside the old PreLoader.tsx, which PreloaderGate no
  // longer renders (PreLoader1 replaced it) — nothing called it since,
  // so the full fetch/decode/compile cost was paid, visibly, on first
  // scroll into the section instead. warmUpServices3d() is idempotent
  // (module-scope cached promise) and fires unconditionally here (even
  // when skipped/isDone) since the shared renderer/program cache is
  // still worth warming on every load, preloader-skipped or not.
  useEffect(() => {
    warmUpServices3d("/cube1-optimized.glb");
  }, []);

  if (isDone || skipped) return null;

  return (
    <Preloader1
      onComplete={() => {
        sessionStorage.setItem(PRELOADER_SESSION_KEY, "1");
        setIsDone(true);

        window.dispatchEvent(new Event("preloader:finish"));
      }}
    />
  );

}
