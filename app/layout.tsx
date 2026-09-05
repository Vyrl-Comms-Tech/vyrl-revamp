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

export const metadata: Metadata = {
  title: "Vyrl Communications",
  description: "",
  icons: {
    icon: "/favicon.avif",
  },
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
