import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static build: `next build` emits plain HTML/CSS/JS into `out/`
  // instead of a Node server + Netlify Functions for SSR/image-optimization
  // routes. This app has no route handlers, middleware, dynamic segments,
  // or server actions, so nothing here depends on a runtime — Netlify's
  // Next.js Runtime plugin was only wrapping page renders in an invocation
  // function because it detected a non-export build, not because anything
  // actually needed one. See next.config.ts's images/headers comments below
  // for the two knock-on changes `output: "export"` requires.
  output: "export",
  experimental: {
    inlineCss: true,
  },
  images: {
    // Next's built-in image optimizer is a server route (`/_next/image`),
    // which doesn't exist in a static export — every next/image URL would
    // 404 in production without this. Images are served as-is (still via
    // next/image's <img>, just without on-the-fly resize/format
    // conversion); see the static-exports doc's "Image Optimization"
    // section for the alternative (a custom Cloudinary loader) if
    // optimized delivery matters more than avoiding it later.
    unoptimized: true,
  },
  // headers() is unsupported under `output: "export"` (build-time only,
  // no server to serve them from). The .mp4 Cache-Control rule this used
  // to set moved to public/_headers, which Netlify applies to the static
  // deploy directly.
};

export default nextConfig;
