import React from "react";
import ProjectsGrid from "../components/Projects/ProjectsGrid";
import ClientReviews from "@/app/components/home/ClientReviews";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import ServicesSecondLast from "../components/services/ServicesSecondLast";

const page = () => {
  return (
    <div>
      <ProjectsGrid />
      <ClientReviews />
      <ServicesSecondLast/>
      {/* <HomeSecondLast /> */}
    </div>
  );
};

export default page;
