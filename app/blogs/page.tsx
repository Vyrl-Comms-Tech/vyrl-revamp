"use client";
import { useState } from "react";
import BlogCards from "@/app/components/Blog/BlogCards";
import BlogParent from "@/app/components/Blog/BlogParent";

const BlogsPage = () => {
  const [active, setActive] = useState("ALL");

  return (
    <div>
      <BlogParent active={active} setActive={setActive} />
      <BlogCards active={active} />
    </div>
  );
};

export default BlogsPage;
