import HomeHero from "@/app/components/home/HomeHero";
import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import TextAndCards from "@/app/components/home/TextAndCards";
import HomeCarousel from "@/app/components/home/HomeCarousel";
import Logos from "@/app/components/home/Logos";
import ClientReviews from "@/app/components/home/ClientReviews";
import Collective from "@/app/components/home/Collective";
import Services3d from "@/app/components/home/Services3d";
import LazySection from "@/app/components/layout/LazySection";

export default function Home() {
  return (
    <>
      <HomeHero />
      <TextAndCards />
      {/* Sits right after the fold on most viewports — LazySection's
          default 600px rootMargin was triggering it at initial page
          load instead of actually deferring it, which meant its
          Three.js render loop (RAF + OrbitControls + AnimationMixer +
          renderer.render every frame) started running from the very
          first paint. A 0px margin means it only mounts once this
          section itself is actually scrolled into view. */}
      <LazySection rootMargin="0px">
        <Services3d />
      </LazySection>
      <LazySection>
        <HomeCarousel />
      </LazySection>
      <LazySection>
        <Logos />
      </LazySection>
      <LazySection>
        <ClientReviews />
      </LazySection>
      <LazySection>
        <Collective />
      </LazySection>
      <LazySection>
        <HomeSecondLast />
      </LazySection>
    </>
  );
}
