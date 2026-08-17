import HeroModelSection from "@/app/components/home/HeroModelSection";
import HomeHero from "@/app/components/home/HomeHero";
import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import TextAndCards from "@/app/components/home/TextAndCards";
import HomeCarousel from "@/app/components/home/HomeCarousel";
import Logos from "@/app/components/home/Logos";
import ClientReviews from "@/app/components/home/ClientReviews";
import Collective from "@/app/components/home/Collective";
import OrbitGallery from "@/app/components/home/OrbitGallery";
import Testimonials from "@/app/components/home/Testimonials";
import Services3d from "@/app/components/home/Services3d";
import Work from "@/app/components/home/Work";
import PartnersSection from "@/app/components/home/PartnersSection";
import LazySection from "@/app/components/layout/LazySection";

export default function Home() {
  return (
    <>
      <HeroModelSection />
      {/* <HomeHero /> */}
      {/* 
       */}
      <TextAndCards />
      <LazySection placeholder={<div style={{ height: "100vh" }} />}>
      <Services3d />
      </LazySection>
      <LazySection placeholder={<div style={{ height: "100vh" }} />}>
      <Work/>
      </LazySection>

      {/* PartnersSection's own ScrollTrigger (".partner-card" entrance)
          kept firing before the user ever scrolled near it — its trigger
          was created and measured against the page's height at mount
          time, but Work's pinned section right above it (and everything
          lazy-mounted below) can still be growing the page's real height
          well after that. Wrapping it in LazySection like every other
          below-the-fold section means it doesn't mount — and therefore
          doesn't create its ScrollTrigger — until it's actually close to
          the viewport, by which point the sections above it have had far
          more time to settle into their final layout. */}
      <LazySection placeholder={<div style={{ height: "50vh" }} />}>
        <PartnersSection
          year="2024"
          clientCount="70+"
          brand="VYRL® COMMUNICATIONS"
        />
      </LazySection>
      <LazySection>

      <Testimonials/>
      </LazySection>
      {/* <LazySection>
        <HomeCarousel />
      </LazySection> */}
        {/* <Logos /> */}
      {/* 
      <LazySection>
      </LazySection> */}
      {/* <LazySection>
        <ClientReviews />
      </LazySection> */}
      <LazySection>
        <OrbitGallery />
      </LazySection>
    </>
  );
}
