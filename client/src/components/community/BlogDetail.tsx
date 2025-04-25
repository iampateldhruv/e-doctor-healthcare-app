import { useQuery } from "@tanstack/react-query";
import { Blog } from "@/lib/types";
import { Link } from "wouter";
import { ChevronLeft, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogDetailProps {
  blogId: string;
}

const BlogDetail = ({ blogId }: BlogDetailProps) => {
  const { data: blog, isLoading } = useQuery<Blog>({
    queryKey: [`/api/blogs/${blogId}`],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${blogId}`);
      if (!res.ok) throw new Error('Failed to fetch blog details');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
        </div>
        
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-40 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="h-64 bg-gray-200 rounded-lg w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <article>
      <div className="mb-6">
        <Link href="/community">
          <a className="text-primary hover:text-blue-700 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to all articles
          </a>
        </Link>
      </div>
      
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h2>
        <div className="flex items-center">
          <img 
            className="h-10 w-10 rounded-full mr-3" 
            src={blog.author?.profileImage || "https://via.placeholder.com/40"} 
            alt={blog.author?.fullName || "Author"} 
          />
          <div>
            <p className="font-medium text-gray-900">{blog.author?.fullName}</p>
            <div className="flex text-sm text-gray-500">
              <time dateTime={blog.publishedAt}>
                {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </time>
              <span className="mx-1">•</span>
              <span>{Math.ceil(blog.content.length / 1500)} min read</span>
            </div>
          </div>
        </div>
      </header>
      
      {blog.featuredImage && (
        <figure className="mb-8">
          <img 
            className="w-full rounded-lg" 
            src={blog.featuredImage} 
            alt={blog.title} 
          />
          <figcaption className="text-sm text-gray-500 text-center mt-2">
            {blog.title}
          </figcaption>
        </figure>
      )}
      
      <div 
        className="prose max-w-none text-gray-700 mb-8"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      
      {/* Article Tags */}
      <div className="mt-8 flex flex-wrap gap-2">
        {blog.tags && blog.tags.map((tag, index) => (
          <Badge key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {tag}
          </Badge>
        ))}
      </div>
      
      {/* Social Sharing */}
      <div className="mt-8 flex items-center space-x-4">
        <span className="text-gray-700 font-medium">Share:</span>
        <a href="#" className="text-gray-500 hover:text-gray-700">
          <Facebook className="h-5 w-5" />
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-700">
          <Twitter className="h-5 w-5" />
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-700">
          <Linkedin className="h-5 w-5" />
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-700">
          <Mail className="h-5 w-5" />
        </a>
      </div>
      
      {/* Author Bio */}
      {blog.author && (
        <div className="mt-10 bg-blue-50 rounded-lg p-6">
          <div className="flex">
            <img 
              className="h-16 w-16 rounded-full mr-4" 
              src={blog.author.profileImage || "https://via.placeholder.com/64"} 
              alt={blog.author.fullName}
            />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">About {blog.author.fullName}</h4>
              <p className="text-gray-600 mt-1">
                {blog.author.role === 'doctor' 
                  ? `Dr. ${blog.author.fullName} is a board-certified healthcare professional specializing in various medical fields. With years of experience in patient care and medical research, Dr. ${blog.author.fullName.split(' ')[1]} is passionate about educating patients and promoting preventive healthcare.`
                  : `${blog.author.fullName} is a health content writer with expertise in medical topics and healthcare education.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogDetail;
