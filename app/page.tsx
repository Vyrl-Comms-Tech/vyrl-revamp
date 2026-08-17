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
import Services3d from "@/app/components/home/Services3d";
import LazySection from "@/app/components/layout/LazySection";

export default function Home() {
  return (
    <>
    <HeroModelSection/>
      {/* <HomeHero />
      */}
      <TextAndCards /> 

      <LazySection placeholder={<div style={{ height: "100vh" }} />}>
        <Services3d />
      </LazySection>
      {/* <LazySection>
        <HomeCarousel />
      </LazySection> */}
      {/* <LazySection>
        <Logos />
      </LazySection> */}
      {/* <LazySection>
        <ClientReviews />
      </LazySection> */}
      <LazySection>
      {/* <Collective /> */}
      <OrbitGallery />
      </LazySection>
    </>
  );
}
