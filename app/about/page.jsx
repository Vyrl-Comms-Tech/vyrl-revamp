import React from "react";
import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import Logos from "@/app/components/home/Logos";
import AboutUsStack from "../components/about/AboutusStack";
import AboutUsStackMobile from "../components/about/AboutusStackMobile";
import AboutHero from "../components/about/AboutHero";
import AboutText from "../components/about/AboutText";
import AboutLogos from "../components/about/AboutLogos";
import AboutPartnersSection from "../components/about/AboutPartnerSection";
import OrbitGallery from "@/app/components/home/OrbitGallery";

import LazySection from "@/app/components/layout/LazySection";
import DraggableMarquee from "../components/about/DraggableMarquee";
import FullBgImage from "../components/layout/FullBgImage";
import ResponsiveSwap from "../components/layout/ResponsiveSwap";
import { getBreadcrumbJsonLd } from "../lib/breadcrumbJsonLd";

export const metadata = {
  title: "About Us",
  description:
    "Vyrl Communications is a Dubai-based creative and growth agency. Since 2024 we've partnered with 70+ brands, bringing together creative direction, strategy, technology, content, and automation.",
  alternates: { canonical: "/about" },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd([{ name: "About", path: "/about" }])),
        }}
      />
      <AboutHero />
      <AboutText />
      <LazySection>
        <ResponsiveSwap
          desktop={<AboutUsStack />}
          mobile={<AboutUsStackMobile />}
        />
      </LazySection>
      {/* <Logos /> */}
      {/* <LazySection>
        <AboutLogos />
      </LazySection> */}
      <LazySection placeholder={<div style={{ height: "50vh" }} />}>
        <AboutPartnersSection
          year="2024"
          clientCount="70+"
          brand="VYRL® COMMUNICATIONS"
        />
      </LazySection>
      <LazySection>
        {/* <TeamProfile /> */}
        <DraggableMarquee />
      </LazySection>
      {/* <SimilarPost /> */}
      <LazySection>
        {/* <HomeSecondLast /> */}
        {/* <OrbitGallery /> */}
      <FullBgImage/>
      </LazySection>
    </div>
  );
};

export default page;
