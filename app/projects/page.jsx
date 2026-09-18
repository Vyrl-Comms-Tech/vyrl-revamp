import React, { Suspense } from "react";
import ProjectsGrid from "../components/Projects/ProjectsGrid";
import ClientReviews from "@/app/components/home/ClientReviews";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import ServicesSecondLast from "../components/services/ServicesSecondLast";
import OrbitGallery from "@/app/components/home/OrbitGallery";
import ResponsiveSwap from "@/app/components/layout/ResponsiveSwap";
import Testimonials from "@/app/components/home/Testimonials";
import FullBgImage from "../components/layout/FullBgImage";
import { getBreadcrumbJsonLd } from "../lib/breadcrumbJsonLd";

export const metadata = {
  title: "Our Work",
  description:
    "Case studies from Vyrl Communications: branding, web and app development, and digital marketing work for clients including Lala Darbar, Sanam Cars, Arabian Estates, Jeikor, and Banda.",
  alternates: { canonical: "/projects" },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd([{ name: "Projects", path: "/projects" }])),
        }}
      />
      <Suspense fallback={null}>
        <ProjectsGrid />
      </Suspense>
      {/* <ResponsiveSwap desktop={<Testimonials />} mobile={<ClientReviews />} /> */}
      {/* <OrbitGallery /> */}
      <FullBgImage/>
      {/* 
      <div className="client-review-section-container-project">
      <ClientReviews />
      </div> */}
      {/* <ServicesSecondLast /> */}
      {/* <HomeSecondLast /> */}
    </div>
  );
};

export default page;
