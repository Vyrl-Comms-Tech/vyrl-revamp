"use client";

import dynamic from "next/dynamic";

// next/dynamic's ssr:false option can only be used from inside a Client
// Component — layout.tsx is a Server Component, so this one-line client
// wrapper is what actually lets the root layout stay a server component
// while still keeping FluidBackground (WebGL/three.js, browser-only)
// out of the server render entirely.
const FluidBackground = dynamic(() => import("./FluidBackground"), {
  ssr: false,
});

export default FluidBackground;
