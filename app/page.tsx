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
import ResponsiveSwap from "@/app/components/layout/ResponsiveSwap";
import Services3d from "@/app/components/home/Services3d";
import Work from "@/app/components/home/Work";
import PartnersSection from "@/app/components/home/PartnersSection";
import LazySection from "@/app/components/layout/LazySection";

export default function Home() {
  return (
    <>
      <HeroModelSection />
      <TextAndCards />
      <LazySection placeholder={<div style={{ height: "100vh" }} />}>
        <Services3d />
      </LazySection>
      <LazySection placeholder={<div style={{ height: "100vh" }} />}>
        <Work />
      </LazySection>
      <LazySection placeholder={<div style={{ height: "50vh" }} />}>
        <PartnersSection
          year="2024"
          clientCount="70+"
          brand="VYRL® COMMUNICATIONS"
        />
      </LazySection>
      <LazySection>
        <ResponsiveSwap desktop={<Testimonials />} mobile={<ClientReviews />} />
      </LazySection>
      <LazySection>
        <OrbitGallery />
      </LazySection>
    </>
  );
}