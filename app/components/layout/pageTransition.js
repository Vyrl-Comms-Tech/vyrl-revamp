import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAP's `pin: true` reparents the pinned DOM node into an auto-generated
// pin-spacer wrapper, entirely outside React's own bookkeeping. Every
// pinned section in this app unwraps that spacer on unmount (gsap.context's
// ctx.revert() / ScrollTrigger instance .kill()) — that's normally enough,
// but a route change committing React's unmount while a pin-spacer is
// still mid-resize (or hasn't been unwrapped yet) can throw a
// "Failed to execute 'removeChild' on 'Node'" and abort the commit
// partway through, which is what used to show the URL changing while the
// old page (e.g. the home hero) stayed visible underneath.
//
// Killing every ScrollTrigger pin closes that race for good: pin-spacers
// are gone and their content restored to plain document flow before
// React ever gets a chance to unmount anything. Called from every click
// handler that navigates via the transition below (Navbar's NavLink,
// PageTransitionLink, ProjectsGrid) — but only AFTER animateTransition()
// below has finished covering the screen, not before. Un-pinning a
// section is itself an instant, visible layout change (e.g. it
// snapped OrbitGallery's pinned .image-orbit — and the footer whose
// translateY reveal rides that same pin — back into normal flow the
// moment it ran), so calling this before the wipe is opaque let that
// reflow flash through visibly for as long as the wipe still had left
// to run.
export const killAllPins = () => {
  ScrollTrigger.getAll().forEach((st) => {
    if (st.pin) st.kill();
  });
};

const ease = "power4.inOut";

// Selects the block grid mounted once in app/layout.tsx (see
// PageTransitionOverlay.jsx) — a single shared overlay that persists
// across every route, rather than a per-page instance that would
// unmount/remount on the very navigation it's meant to cover.
const getBlocks = () =>
  typeof document !== "undefined"
    ? document.querySelectorAll(".page-transition-block")
    : [];

// A solid-black wipe reads fine going into a white-hero page, but
// blends almost invisibly into a page whose own hero is ALSO black
// (e.g. clicking into /projects or /contact-us from anywhere) — the
// cover/reveal barely registers as having happened. Keying the wipe's
// own color off the DESTINATION route (looked up here by
// animateTransition, not passed manually at every call site) means it
// always contrasts against whatever's about to be revealed: white
// blocks going into a black-hero page, black blocks everywhere else.
// Case-study routes aren't listed — they never reach animateTransition
// at all (see isCaseStudyPath below, checked before this is called).
const BLACK_HERO_PATHS = ["/projects", "/contact-us"];

const getWipeColor = (destinationPath) => {
  if (!destinationPath) return "#000";
  const path = destinationPath.split("?")[0].split("#")[0];
  return BLACK_HERO_PATHS.includes(path) ? "#fff" : "#000";
};

// Reveals the new page after a client-side route change: the grid is
// currently covering the whole screen (however animateTransition left
// it) and each block scales back down to hidden, uncovering the new
// route's content underneath. Called from PageTransitionOverlay.jsx on
// every pathname change after the first (see that file for why the
// very first page load is excluded — this app's separate preloader
// owns that reveal instead).
export function revealTransition() {
  return new Promise((resolve) => {
    const blocks = getBlocks();
    if (!blocks.length) {
      resolve();
      return;
    }
    gsap.set(blocks, { scaleY: 1, visibility: "visible" });
    gsap.to(blocks, {
      scaleY: 0,
      duration: 1,
      stagger: {
        each: 0.1,
        from: "start",
        grid: "auto",
        axis: "x",
      },
      ease,
      onComplete: () => {
        gsap.set(blocks, { visibility: "hidden" });
        resolve();
      },
    });
  });
}

// Plays on every client-side navigation: blocks scale UP from 0 to
// fully cover the screen, then the caller navigates (router.push)
// once this resolves — the new route's content is safely hidden
// behind the grid by the time it mounts. The reveal half (scaling
// back down to 0) is handled per-route by whichever component calls
// revealTransition() again after the new page has settled — see
// PageTransitionLink.tsx/Navbar.jsx/ProjectsGrid.jsx, which call this
// before router.push and rely on the new page's own mount effect (or
// a shared one in layout.tsx) to reveal again.
//
// destinationPath (the href being navigated to) picks the wipe's own
// color via getWipeColor above — every call site already has this
// value on hand (it's the same href/project.href being passed to
// router.push right after), so this is the only piece of per-
// navigation state animateTransition needs from its caller.
export function animateTransition(destinationPath) {
  return new Promise((resolve) => {
    const blocks = getBlocks();
    if (!blocks.length) {
      resolve();
      return;
    }
    gsap.set(blocks, {
      visibility: "visible",
      scaleY: 0,
      backgroundColor: getWipeColor(destinationPath),
    });
    gsap.to(blocks, {
      scaleY: 1,
      duration: 1,
      stagger: {
        each: 0.1,
        from: "start",
        grid: [2, 5],
        axis: "x",
      },
      ease,
      onComplete: resolve,
    });
  });
}

// Case-study pages already run their own hand-built transition (a
// heading clone flies between pages, timed against its own overlay and
// a plain router.push — see CaseStudyInner.jsx). Layering the block
// wipe on top of that would fight it, so navigations into/out of these
// routes are excluded and just navigate normally.
export const CASE_STUDY_PATHS = [
  "/lala-darbar",
  "/sanamcars",
  "/arabian-estate",
  "/banda",
  "/jeikor",
];

export const isCaseStudyPath = (path) => CASE_STUDY_PATHS.includes(path);
