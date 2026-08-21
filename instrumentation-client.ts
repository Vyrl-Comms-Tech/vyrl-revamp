// Runs after the static HTML loads but before React hydration. Mark repeat
// visits early enough for preloader1.css to hide the server-rendered loader,
// without putting a <script> element inside React's persistent layout.
try {
  const preloaderShown = sessionStorage.getItem("vyrl-preloader-shown");

  if (preloaderShown) {
    document.documentElement.classList.add("preloader-skip");

    const navigationEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;

    if (navigationEntry?.type === "reload") {
      document.documentElement.classList.add("page-refresh-transition");
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
  }
} catch {
  // Storage can be unavailable in restricted browsing modes. In that case,
  // leave the class unset and safely play the preloader.
}
