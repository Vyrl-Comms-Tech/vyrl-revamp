const SITE_URL = "https://vyrl.ae";

/**
 * BreadcrumbList schema — lets Google show a breadcrumb trail in search
 * results instead of the raw URL, and gives crawlers an explicit site
 * hierarchy signal. `segments` excludes Home, which this always prepends.
 */
export function getBreadcrumbJsonLd(
  segments: { name: string; path: string }[],
) {
  const items = [{ name: "Home", path: "/" }, ...segments];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
