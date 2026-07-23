// Shared WAAPI keyframes for next-view-transitions' onTransitionReady hook.
// The old page fades/slides up slightly while the new page reveals
// upward over it, matching the reference video's effect.
export const slideInOut = () => {
  document.documentElement.animate(
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0.2, transform: "translateY(-35%)" },
    ],
    {
      duration: 900,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    },
  );

  // translateY instead of clip-path: clip-path's inset() has to be
  // rasterized fresh every frame (no GPU compositing fast-path), which
  // is what read as jittery/laggy. transform is GPU-accelerated, so
  // sliding the new page up from 100% is just as visually "reveals
  // upward" but animates smoothly.
  document.documentElement.animate(
    [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }],
    {
      duration: 900,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    },
  );
};

// Case-study pages already run their own hand-built transition (a
// heading clone flies between pages, timed against its own overlay and
// a plain router.push — see CaseStudyInner.jsx). Layering this
// view-transition slide on top of that would fight it, so navigations
// into/out of these routes are excluded and just navigate normally.
export const CASE_STUDY_PATHS = [
  "/lala-darbar",
  "/sanamcars",
  "/arabian-estate",
  "/banda",
  "/jeikor",
];

export const isCaseStudyPath = (path) => CASE_STUDY_PATHS.includes(path);
