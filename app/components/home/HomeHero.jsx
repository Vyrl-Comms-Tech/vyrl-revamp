"use client";
import UnicornEmbed from "../layout/UnicornEmbed";
import "../../styles/home-hero.css";
import TextAnimation from "./TextAnimation";

const HomeHero = () => {
  return (
    <div className="homehero">
      <UnicornEmbed projectId="hTmImmClFTsnrs3vLhd0" />

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
