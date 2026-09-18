import Testimonials from "@/app/components/home/Testimonials";
import ResponsiveSwap from "@/app/components/layout/ResponsiveSwap";
import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import ClientReviews from "@/app/components/home/ClientReviews";
import VyrlAbout from "@/app/components/home/VyrlAbout";
import OrbitGallery from "@/app/components/home/OrbitGallery";
import Services3d from "@/app/components/home/Services3d";
import Slider from "@/app/components/services/Slider";
import FullBgImage from "../components/layout/FullBgImage";
import { getBreadcrumbJsonLd } from "../lib/breadcrumbJsonLd";

export const metadata = {
  title: "Services",
  description:
    "Vyrl Communications' services: strategy & consultancy, branding & creative direction, web & app development, content & social media, performance marketing, and AI automation & tech solutions.",
  alternates: { canonical: "/services" },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd([{ name: "Services", path: "/services" }])),
        }}
      />
      <Slider />
      <Services3d dark />
      <ResponsiveSwap desktop={<Testimonials />} mobile={<ClientReviews />} />
      <VyrlAbout />
      {/* <SimilarPost /> */}
      {/* <HomeSecondLast /> */}
      {/* <OrbitGallery /> */}
      <FullBgImage/>
    
    </div>
  );
};

export default page;
