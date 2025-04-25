import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, Blog } from "@/lib/types";
import BlogDetail from "@/components/community/BlogDetail";
import CommentSection from "@/components/community/CommentSection";

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();

  const { data: blog, isLoading: blogLoading } = useQuery<Blog>({
    queryKey: [`/api/blogs/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch blog details');
      return res.json();
    }
  });

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  // Redirect if blog not found
  useEffect(() => {
    if (!blogLoading && !blog) {
      setLocation("/community");
    }
  }, [blog, blogLoading, setLocation]);

  if (blogLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-md rounded-lg mt-8">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
            <div className="h-6 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="space-y-3 mb-8">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-md rounded-lg mt-8">
      <div className="max-w-4xl mx-auto">
        <BlogDetail blogId={id} />
        <CommentSection blogId={id} currentUser={user} />
      </div>
    </section>
  );
};

export default BlogDetailPage;
