"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Pages that render OrbitGallery.jsx (home, about) already show their
// own embedded copy of .footer as part of its orbit/pin scroll
// choreography — this global, layout-level copy would just duplicate
// it there, so it skips rendering entirely on those two routes instead
// of relying on CSS alone (the mobile-only visibility below isn't
// enough by itself: OrbitGallery's own footer is *also* visible on
// mobile, per its own responsive fix, so without this check mobile
// visitors on "/" or "/about" would see two footers stacked).
const ORBIT_GALLERY_PATHS = ["", ""];

// Visible on mobile only (see .global-footer-mobile-only in
// globals.css) — above 800px, pages without OrbitGallery currently have
// no footer at all, matching existing behavior; pages with OrbitGallery
// get its own desktop pin-reveal footer instead.
export default function GlobalFooter() {
  const pathname = usePathname();
  if (ORBIT_GALLERY_PATHS.includes(pathname)) return null;

  return (
    <div className="global-footer-mobile-only">
      <Footer />
    </div>
  );
}
