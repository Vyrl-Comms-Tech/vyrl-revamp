import React from "react";
import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import Logos from "@/app/components/home/Logos";
import AboutUsStack from "../components/about/AboutusStack";
import AboutHero from "../components/about/AboutHero";
import AboutText from "../components/about/AboutText";
import AboutLogos from "../components/about/AboutLogos";
import PartnersSection from "@/app/components/home/PartnersSection";
import OrbitGallery from "@/app/components/home/OrbitGallery";

import LazySection from "@/app/components/layout/LazySection";
import DraggableMarquee from "../components/about/DraggableMarquee";
const page = () => {
  return (
    <div>
      <AboutHero />
      <AboutText />
      <LazySection>
        <AboutUsStack />
      </LazySection>
      {/* <Logos /> */}
      {/* <LazySection>
        <AboutLogos />
      </LazySection> */}
      <LazySection placeholder={<div style={{ height: "50vh" }} />}>
        <PartnersSection
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
        <OrbitGallery />
      </LazySection>
    </div>
  );
};

export default page;
