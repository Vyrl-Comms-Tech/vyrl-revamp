import TeamProfile from "@/app/components/about/TeamProfie";
import React from "react";
import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import Logos from "@/app/components/home/Logos";
import AboutUsStack from "../components/about/AboutusStack";
import AboutHero from "../components/about/AboutHero";
import AboutImg from "../components/about/aboutImg";
import AboutText from "../components/about/AboutText";
import AboutLogos from "../components/about/AboutLogos";
const page = () => {
  return (
    <div>
      <div className="aboutImg-desktop-only">
        <AboutImg />
      </div>
      <AboutHero mobileWordmark={<AboutImg />} />
      <AboutText />
      <AboutUsStack />
      {/* <Logos /> */}
      <AboutLogos />
      <TeamProfile />
      {/* <SimilarPost /> */}
      <HomeSecondLast />
    </div>
  );
};

export default page;
