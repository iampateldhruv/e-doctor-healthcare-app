import { useQuery } from "@tanstack/react-query";
import { Blog } from "@/lib/types";
import { Link } from "wouter";
import { Eye, MessageSquare } from "lucide-react";

const FeaturedBlogs = () => {
  const { data: blogs, isLoading } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow-md animate-pulse">
            <div className="h-48 bg-gray-200 w-full"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
      {blogs && blogs.map((blog) => (
        <div key={blog.id} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <Link href={`/blog/${blog.id}`}>
            <a>
              <img 
                className="w-full h-48 object-cover" 
                src={blog.featuredImage || "https://via.placeholder.com/800x400"} 
                alt={blog.title} 
              />
            </a>
          </Link>
          <div className="p-5">
            <Link href={`/blog/${blog.id}`}>
              <a>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
              </a>
            </Link>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <img 
                className="h-8 w-8 rounded-full mr-2" 
                src={blog.author?.profileImage || "https://via.placeholder.com/40"} 
                alt={blog.author?.fullName || "Author"} 
              />
              <span>{blog.author?.fullName}</span>
              <span className="mx-2">•</span>
              <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
            <Link href={`/blog/${blog.id}`}>
              <a className="text-primary hover:text-blue-700 font-medium">Read more →</a>
            </Link>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center text-gray-500 text-sm">
                <Eye className="mr-1 h-4 w-4" /> {blog.views} views
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <MessageSquare className="mr-1 h-4 w-4" /> {blog.commentsCount || 0} comments
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedBlogs;
