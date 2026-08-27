"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/layout/Navbar";
import PreloaderGate from "@/app/components/layout/PreloaderGate";
import PageTransitionOverlay from "@/app/components/layout/PageTransitionOverlay";
import Chatbot from "@/app/components/layout/Chatbot";

export default function SiteChrome() {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  if (isDashboardRoute) return null;

  return (
    <>
      <PreloaderGate />
      <Navbar />
      {/* <Chatbot /> */}
      <PageTransitionOverlay />
    </>
  );
}
