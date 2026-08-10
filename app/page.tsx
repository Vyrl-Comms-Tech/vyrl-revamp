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
      {/* Services3d pins itself for a full viewport height (100vh) the
          instant it mounts — LazySection's default placeholder is a
          height:0 div, so mounting the real section swapped in a full
          extra viewport's worth of page height right as the user's
          momentum scroll was already moving through that exact spot
          (worst on iOS, whose momentum scroll covers the 600px
          rootMargin fastest). That layout shift landed mid-gesture and
          could carry the scroll position straight past the pin's
          `start` before ScrollTrigger's pin had a chance to engage —
          reproduced as "no sticky the first time, sticky the second
          time" (the trigger already exists correctly on the second
          pass). Matching the placeholder's height to the real section's
          100vh means mounting it is a no-op for scroll position/page
          height, so there's nothing left to shift out from under an
          in-flight scroll gesture. */}
      <LazySection placeholder={<div style={{ height: "100vh" }} />}>
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

      {/* Same fix as Services3d above — Collective also pins itself at
          100vh, so its mount is height-matched to avoid the same
          layout-shift-mid-scroll race on iOS. */}
      <LazySection placeholder={<div style={{ height: "100vh" }} />}>
        <Collective />
      </LazySection>
      <LazySection>
        <HomeSecondLast />
      </LazySection>
    </>
  );
}
