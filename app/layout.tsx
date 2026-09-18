import type { Metadata } from "next";
import ReactDOM from "react-dom";
import GlobalFooter from "./components/layout/GlobalFooter";
import localFont from "next/font/local";
import "./globals.css";
import "./styles/heromodel-section.css";
import "./styles/page-transition.css";
import SmoothScroll from "@/app/components/layout/SmoothScroll";
import PreloaderGate from "@/app/components/layout/PreloaderGate";
import PageTransitionOverlay from "@/app/components/layout/PageTransitionOverlay";
// import Chatbot from "@/app/components/layout/Chatbot"; // mid-merge-conflict, whole file commented out — see git status (UU)
import SiteChrome from "@/app/components/layout/SiteChrome";
import FluidBackground from "@/app/components/layout/FluidBackgroundLoader";

const laygrotesk = localFont({
  src: [
    {
      path: "../public/fonts2/laygrotesk-trial-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts2/laygrotesk-trial-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts2/laygrotesk-trial-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts2/laygrotesk-trial-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts2/laygrotesk-trial-black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-laygrotesk",
  display: "swap",
});

const SITE_URL = "https://vyrl.ae";
const SITE_DESCRIPTION =
  "Vyrl Communications is a Dubai-based creative and growth agency offering strategy & consultancy, branding & creative direction, web & app development, content & social media, performance marketing, and AI automation & tech solutions.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vyrl Communications | Creative & Growth Agency in Dubai",
    template: "%s | Vyrl Communications",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.avif",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Vyrl Communications",
    title: "Vyrl Communications | Creative & Growth Agency in Dubai",
    description: SITE_DESCRIPTION,
    images: ["/favicon.avif"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyrl Communications | Creative & Growth Agency in Dubai",
    description: SITE_DESCRIPTION,
    images: ["/favicon.avif"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vyrl Communications",
  alternateName: "VYRL",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.avif`,
  description: SITE_DESCRIPTION,
  email: "grow@vyrl.ae",
  telephone: "+971585134999",
  address: {
    "@type": "PostalAddress",
    streetAddress: "International Business Tower, Business Bay",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  sameAs: [
    "https://www.linkedin.com/company/vyrl-communications/",
    "https://www.facebook.com/vyrl.ae/",
    "https://www.instagram.com/vyrl.ae/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  ReactDOM.preload("/cube1-optimized.glb", {
    as: "fetch",
    crossOrigin: "anonymous",
  });

  return (
    <html lang="en" className={`${laygrotesk.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* <FluidBackground /> */}
        <SmoothScroll />
        {/* <Header /> */}
        <SiteChrome />
        {children}
        <GlobalFooter />
        {/* <Chatbot /> */}
        <PageTransitionOverlay />
      </body>
    </html>
  );
}
