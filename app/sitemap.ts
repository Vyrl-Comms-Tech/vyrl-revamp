import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://vyrl.ae";

const routes = [
  "",
  "about",
  "services",
  "projects",
  "blogs",
  "contact-us",
  "privacy-policy",
  "terms-and-condition",
  "arabian-estate",
  "banda",
  "jeikor",
  "lala-darbar",
  "sanamcars",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}/${route}`,
    lastModified: new Date(),
  }));
}
