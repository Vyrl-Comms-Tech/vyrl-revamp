import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lighthouse flagged ~570ms of render-blocking CSS <link> requests —
  // this site imports CSS per-component (many small stylesheets) rather
  // than one bundled framework file, so the fix is inlining critical CSS
  // into <style> tags in <head> instead of separate blocking requests,
  // not further chunk-merging (cssChunking is already Next's default).
  // Production-build only; no effect in `next dev`.
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
  },
  async headers() {
    return [
      {
        source: "/:path*.mp4",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
