import { ScrollTrigger } from "gsap/ScrollTrigger";

let refreshFrame = null;
let forceRefresh = false;

/**
 * Coalesces refresh requests from independently mounted sections into one
 * layout pass on the next animation frame. ScrollTrigger.refresh() measures
 * the whole page, so running it once per component in the same frame causes
 * avoidable synchronous reflows.
 */
export function scheduleScrollTriggerRefresh(force = false) {
  forceRefresh ||= force;

  if (refreshFrame !== null) return;

  refreshFrame = requestAnimationFrame(() => {
    const shouldForce = forceRefresh;
    refreshFrame = null;
    forceRefresh = false;
    ScrollTrigger.refresh(shouldForce);
  });
}
