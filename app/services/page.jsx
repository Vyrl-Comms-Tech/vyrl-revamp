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
const page = () => {
  return (
    <div>
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
