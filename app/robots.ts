import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://vyrl.ae";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login"],
      },
      // Named explicitly so AI answer engines (ChatGPT, Perplexity,
      // Gemini, Google AI Overviews) don't fall back to a stricter
      // default if they ever ignore the wildcard rule above.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-User", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "GoogleOther", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      // Bing's index is what ChatGPT's and Microsoft Copilot's web
      // search features query against, so this matters beyond Bing.co
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "MSNBot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
