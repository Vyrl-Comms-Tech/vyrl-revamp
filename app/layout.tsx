import type { Metadata } from "next";
import ReactDOM from "react-dom";
import GlobalFooter from "./components/layout/GlobalFooter";
import localFont from "next/font/local";
import "./globals.css";
import "./styles/heromodel-section.css";
import "./styles/page-transition.css";
import Navbar from "@/app/components/layout/Navbar";
import SmoothScroll from "@/app/components/layout/SmoothScroll";
import PreloaderGate from "@/app/components/layout/PreloaderGate";
import PageTransitionOverlay from "@/app/components/layout/PageTransitionOverlay";
import Chatbot from "@/app/components/layout/Chatbot";
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
  // Kicks off the browser's fetch for the services-cube GLB from the very
  // first HTML chunk, before any client JS (PreloaderGate's warm-up effect,
  // Services3d's own loadGLTF) ever runs — by the time warmUpServices3d()
  // calls fetch() on this same URL, the network request is already
  // in-flight or complete, so only the parse/Draco-decode/shader-compile
  // work is left to do server-side... err, hidden during the preloader.
  // `as: "fetch"` + crossOrigin matches how three.js's GLTFLoader actually
  // requests it, so the preloaded response is reused instead of double-fetched.
  ReactDOM.preload("/cube1-optimized.glb", {
    as: "fetch",
    crossOrigin: "anonymous",
  });

  return (
    <html lang="en" className={`${laygrotesk.variable} h-full antialiased`}>
      <body className="min-h-full">
        <PreloaderGate />
        {/* <FluidBackground /> */}
        <SmoothScroll />
        {/* <Header /> */}
        <Navbar />
        {children}
        <GlobalFooter />
        <Chatbot />
        <PageTransitionOverlay />
      </body>
    </html>
  );
}
