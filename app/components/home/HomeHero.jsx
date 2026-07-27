"use client";
import Script from "next/script";
import "../../styles/home-hero.css";

const HomeHero = () => {
  return (
    <div className="homehero">
      <div
        style={{ width: "100%", height: "100%" }}
        data-us-project="eWb7ceke9RYVHKByTGA5"
      />
      <h1 className="homehero-heading">
        Modern Digital Experiences
        <br />
        Built For Brands That Move Different
      </h1>
      <Script
        src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.8/dist/unicornStudio.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.UnicornStudio?.init();
        }}
      />
    </div>
  );
};

export default HomeHero;
