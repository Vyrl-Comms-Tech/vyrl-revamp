import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// HARD-NAVIGATION page transition
// ----------------------------------------------------------------------------
// Ported from the old (pre-Next.js-App-Router) site's PageTransition.jsx,
// which the user asked to match: every internal navigation is a REAL browser
// navigation (window.location.href), not a Next.js client-side router.push().
//
// Why: router.push() keeps every mounted component, every GSAP context/
// ScrollTrigger, and document.body's inline styles alive across the
// "navigation" — the new route's components mount ON TOP of whatever the
// previous route left behind, and cleanup is only ever as good as each
// component's own unmount effect. That's the entire root cause behind the
// long tail of cross-page bugs this app kept hitting (document.body color
// leaking between routes, stale ScrollTrigger pins, Lenis cache going stale,
// etc — see the extensive comments previously on killAllPins() in this
// file's git history) — every one of them was a symptom of trying to
// simulate a clean slate on top of a persistent JS environment.
//
// A hard navigation sidesteps the entire category for free: the browser
// tears down the whole page (every tween, every ScrollTrigger, every inline
// style, Lenis, all of it) and the new route starts from a genuinely blank
// document, exactly like a fresh page load — because it is one. The
// tradeoff is losing the SPA's instant/no-reload navigation feel, which is
// exactly why the block-grid wipe below exists: it covers the screen before
// the real navigation fires and reveals it again after the new page has
// settled, so the reload itself is never seen — same purpose the old site's
// overlay served, just with this app's existing block-grid visual instead
// of a single plain div.
// ============================================================================

let transitionPending = false;
let transitionColor = "#000";
let navigationInProgress = false;

const ease = "power4.inOut";

// Selects the block grid mounted once in app/layout.tsx (see
// PageTransitionOverlay.jsx). On a hard navigation this DOM is destroyed
// and recreated fresh on every single page load (there's no persistent
// SPA shell to keep it alive across), so unlike the old SPA-nav version
// this never needs to survive a route change — only survive from "click"
// to "the new document's first paint", which sessionStorage (below)
// carries it across.
const getBlocks = () =>
  typeof document !== "undefined"
    ? document.querySelectorAll(".page-transition-block")
    : [];

// A solid-black wipe reads fine going into a white-hero page, but blends
// almost invisibly into a page whose own hero is ALSO black (e.g. /projects
// or /contact-us) — the cover/reveal barely registers as having happened.
// Keying the wipe's own color off the DESTINATION route means it always
// contrasts against whatever's about to be revealed: white blocks going
// into a black-hero page, black blocks everywhere else. Stashed in
// sessionStorage (not just computed twice) so the reveal on the NEW page
// load uses the exact same color the cover used, rather than recomputing
// against what might be a different set of rules by then.
const BLACK_HERO_PATHS = ["/projects", "/contact-us"];

const getWipeColor = (destinationPath) => {
  if (!destinationPath) return "#000";
  const path = destinationPath.split("?")[0].split("#")[0];
  return BLACK_HERO_PATHS.includes(path) ? "#fff" : "#000";
};

// ----------------------------------------------------------------------------
// Phase 1 — cover the screen, then hard-navigate.
// Called from every internal nav link's click handler (Navbar's NavLink,
// PageTransitionLink, ProjectsGrid's card clicks).
// ----------------------------------------------------------------------------
export function triggerNavigation(destinationPath, navigate) {
  if (navigationInProgress) return;
  navigationInProgress = true;

  const blocks = getBlocks();
  const wipeColor = getWipeColor(destinationPath);

  if (!blocks.length) {
    // No overlay DOM found (shouldn't happen — PageTransitionOverlay is
    // mounted once in layout.tsx — but fail open rather than stranding
    // the user on a dead link if it's ever missing).
    navigationInProgress = false;
    navigate?.(destinationPath);
    return;
  }

  gsap.killTweensOf(blocks);
  gsap.set(blocks, {
    visibility: "visible",
    scaleY: 0,
    backgroundColor: wipeColor,
  });
  gsap.to(blocks, {
    scaleY: 1,
    duration: 0.55,
    stagger: { each: 0.05, from: "start", grid: [2, 5], axis: "x" },
    ease,
    overwrite: "auto",
    onComplete: () => {
      // Screen is now fully covered — safe to do anything visible here,
      // same timing guarantee the old SPA version relied on for
      // killAllPins()/router.push(). Reset scroll before navigating so
      // the browser doesn't briefly show the new document scrolled to
      // wherever this one happened to be (some browsers restore scroll
      // position per-URL automatically, but this covers the general
      // case since we're about to leave anyway).
      window.lenis?.stop();

      // Revert GSAP pin spacers before React removes the outgoing route.
      // This prevents removeChild NotFoundError during client navigation.
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));

      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);

      // Flags read by revealTransition() below, on the NEW page's own
      // load — sessionStorage (not a JS variable) is the only thing
      // that survives a real navigation.
      transitionPending = true;
      transitionColor = wipeColor;
      navigate?.(destinationPath);
    },
  });
}

// Browser Back/Forward does not pass through PageTransitionLink. popstate is
// already changing the history entry, so cover synchronously and restore all
// GSAP-owned pin DOM before Next removes the outgoing React tree.
export function prepareForHistoryNavigation(destinationPath) {
  if (navigationInProgress) return;

  navigationInProgress = true;
  transitionPending = true;
  transitionColor = getWipeColor(destinationPath);

  const blocks = getBlocks();
  gsap.killTweensOf(blocks);
  gsap.set(blocks, {
    visibility: "visible",
    scaleY: 1,
    backgroundColor: transitionColor,
  });

  window.lenis?.stop();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
}

// ----------------------------------------------------------------------------
// Phase 2 — reveal the new page.
// Called once, on mount, by PageTransitionOverlay.jsx on every page load.
// If the flag from phase 1 is present, the overlay starts already covering
// (in the same color phase 1 left it) and scales back down to reveal the
// fresh page underneath; otherwise (direct load / external link / first
// visit) the overlay just stays hidden — this app's separate PreloaderGate
// owns revealing a genuine first load.
// ----------------------------------------------------------------------------
export function revealTransitionIfPending() {
  if (!transitionPending) return;
  transitionPending = false;
  const wipeColor = transitionColor;

  const blocks = getBlocks();
  if (!blocks.length) return;

  gsap.set(blocks, {
    visibility: "visible",
    scaleY: 1,
    backgroundColor: wipeColor,
  });

  ScrollTrigger.refresh(true);
  window.lenis?.resize();
  window.lenis?.start();

  // A short delay before revealing (rather than revealing the instant this
  // runs) gives the new page's own mount effects — GSAP contexts,
  // ScrollTrigger creation, any deferred double-rAF measurement blocks
  // (Work.jsx, AboutPartnerSection.jsx, etc.) — a moment to run first, so
  // the wipe never uncovers a page mid-way through its own setup. Same
  // reasoning as PageTransitionOverlay.jsx's own two-rAF defer for the
  // SPA-era reveal; a flat timeout is used here instead of rAF chaining
  // since this now runs once, on a fresh document, not on every pathname
  // change.
  gsap.delayedCall(0.05, () => {
    gsap.to(blocks, {
      scaleY: 0,
      duration: 0.55,
      stagger: { each: 0.05, from: "start", grid: "auto", axis: "x" },
      ease,
      overwrite: "auto",
      onComplete: () => {
        gsap.set(blocks, { visibility: "hidden" });
        navigationInProgress = false;
      },
    });
  });
}

// Case-study pages already run their own hand-built transition (a heading
// clone flies between pages, timed against its own overlay — see
// CaseStudyInner.jsx), which still uses Next.js's client-side router.push()
// internally rather than a hard navigation. Layering this hard-nav wipe on
// top of that would fight it, so navigations INTO these routes via a plain
// nav link are excluded and just let CaseStudyInner's own SPA-based
// transition handle it (navigating between two case studies stays a
// client-side transition, unchanged from before). Leaving a case-study page
// via a normal nav link still uses this hard-nav wipe like everywhere else.
export const CASE_STUDY_PATHS = [
  "/lala-darbar",
  "/sanamcars",
  "/arabian-estate",
  "/banda",
  "/jeikor",
];

export const isCaseStudyPath = (path) => CASE_STUDY_PATHS.includes(path);
