import BlogCards from "@/app/components/blog/BlogCards";
import BlogParent from "@/app/components/blog/BlogParent";

const page = () => {
  return (
    <div>
      <BlogParent />
      <BlogCards />
    </div>
  );
};

export default page;
