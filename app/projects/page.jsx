import React, { Suspense } from "react";
import ProjectsGrid from "../components/Projects/ProjectsGrid";
import ClientReviews from "@/app/components/home/ClientReviews";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import ServicesSecondLast from "../components/services/ServicesSecondLast";
import OrbitGallery from "@/app/components/home/OrbitGallery";
import ResponsiveSwap from "@/app/components/layout/ResponsiveSwap";
import Testimonials from "@/app/components/home/Testimonials";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <ProjectsGrid />
      </Suspense>
      <ResponsiveSwap desktop={<Testimonials />} mobile={<ClientReviews />} />
      <OrbitGallery />

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
