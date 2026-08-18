"use client";
import { useCallback, useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 800;
const getServerSnapshot = () => null;

/**
 * ResponsiveSwap
 * ---------------
 * Mounts exactly one of `desktop` / `mobile` based on viewport width,
 * never both. Used where two different, heavier client components
 * (their own GSAP timelines/ScrollTriggers, not just different styling)
 * cover the same slot on desktop vs mobile — e.g. Testimonials on
 * desktop, ClientReviews on mobile. A pure CSS media-query show/hide
 * would still mount, run, and scroll-animate the hidden one, wasting
 * cycles and risking scroll-trigger conflicts between two live
 * ScrollTriggers claiming the same document position. Actually
 * unmounting the wrong one avoids both problems.
 *
 * Renders nothing until the viewport width is known (first client
 * render, post-hydration) — same tradeoff LazySection.tsx makes
 * elsewhere in this app: a below-the-fold section briefly rendering
 * nothing on first paint is preferable to a hydration mismatch from
 * guessing the viewport size on the server.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.desktop  Rendered when viewport width >= 800px.
 * @param {React.ReactNode} props.mobile   Rendered when viewport width < 800px.
 * @param {number} [props.breakpoint]      Override the default 800px cutoff.
 */
export default function ResponsiveSwap({
  desktop,
  mobile,
  breakpoint = MOBILE_BREAKPOINT,
}) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const subscribe = useCallback(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const isMobile = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Keep a host node mounted across the initial effect and breakpoint
  // changes. Without it, React has to insert the selected branch beside
  // nodes that ScrollTrigger may have wrapped/moved in the meantime. That
  // can leave React's fragment anchor pointing at a node whose parent has
  // changed and results in an insertBefore NotFoundError.
  //
  // `display: contents` makes the host structurally useful to React without
  // introducing a box or changing the section's existing layout.
  return (
    <div style={{ display: "contents" }}>
      {isMobile === null ? null : isMobile ? mobile : desktop}
    </div>
  );
}
