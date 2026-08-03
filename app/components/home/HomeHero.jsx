"use client";
import UnicornEmbed from "../layout/UnicornEmbed";
import "../../styles/home-hero.css";
import TextAnimation from "./TextAnimation";

const HomeHero = () => {
  return (
    <div className="homehero">
      {/* <UnicornEmbed projectId="hTmImmClFTsnrs3vLhd0" /> */}
      <div className="relative h-full w-full overflow-hidden">
        <img
          src="/fall1.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <UnicornEmbed
          projectId="hTmImmClFTsnrs3vLhd0"
          className="absolute inset-0"
        />
      </div>
      <div className="homehero-fade" aria-hidden="true" />

      <h1 className="homehero-heading">
        Modern Digital Experiences
        <br />
        Built For Brands That Move Different
      </h1>
      <p className="homehero-tag">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
        >
          <circle cx="4" cy="4" r="4" fill="white" />
        </svg>
        Digital Campaign
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="none"
        >
          <circle cx="4" cy="4" r="4" fill="white" />
        </svg>
      </p>
    </div>
  );
};

export default HomeHero;
