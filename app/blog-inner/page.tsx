import BlogInner from "@/app/components/Blog/BlogInner";

import SimilarPost from "@/app/components/home/SimilarPost";
import HomeSecondLast from "@/app/components/home/HomeSecondLast";
const page = () => {
  return (
    <div>
      <BlogInner />
      <SimilarPost />
      <HomeSecondLast /> 
    </div>
  );
};

export default page;
