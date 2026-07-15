import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
import ClientReviews from "@/app/components/home/ClientReviews";
import VyrlAbout from "@/app/components/home/VyrlAbout";
import Services3d from "@/app/components/home/Services3d";
import Slider from "@/app/components/services/Slider";
const page = () => {
  return (
    <div>
      <Slider/>
      <Services3d dark />
      <ClientReviews />
      <VyrlAbout />
      <SimilarPost />
      <HomeSecondLast />
    </div>
  );
};

export default page;
