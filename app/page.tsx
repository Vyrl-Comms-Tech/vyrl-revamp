import HomeHero from "@/app/components/home/HomeHero";
import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import TextAndCards from "@/app/components/home/TextAndCards";
import HomeCarousel from "@/app/components/home/HomeCarousel";
import Logos from "@/app/components/home/Logos";
import ClientReviews from "@/app/components/home/ClientReviews";
import Collective from "@/app/components/home/Collective";
import Services3d from "@/app/components/home/Services3d";

export default function Home() {
  return (
    <>
      <HomeHero />
      <TextAndCards />
      <Services3d />
      <HomeCarousel />
      <Logos />
      <ClientReviews />
      <Collective />
      <SimilarPost />
      <HomeSecondLast />
    </>
  );
}
