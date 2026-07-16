import React from "react";
import ProjectsGrid from "../components/Projects/ProjectsGrid";
import ClientReviews from "@/app/components/home/ClientReviews";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";

const page = () => {
  return (
    <div>
      <ProjectsGrid />
      <ClientReviews />
      <HomeSecondLast />
    </div>
  );
};

export default page;
