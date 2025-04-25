import { useState } from "react";
import FeaturedBlogs from "@/components/community/FeaturedBlogs";

const Community = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-md rounded-lg mt-8">
      <div className="border-b border-gray-200 pb-5 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Health Community</h2>
        <p className="mt-1 text-sm text-gray-500">
          Health articles, blogs and discussions from our medical experts
        </p>
      </div>
      
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <CategoryFilter 
          name="All" 
          isActive={activeFilter === "all"}
          onClick={() => handleFilterChange("all")}
        />
        <CategoryFilter 
          name="Heart Health" 
          isActive={activeFilter === "heart-health"}
          onClick={() => handleFilterChange("heart-health")}
        />
        <CategoryFilter 
          name="Mental Health" 
          isActive={activeFilter === "mental-health"}
          onClick={() => handleFilterChange("mental-health")}
        />
        <CategoryFilter 
          name="Nutrition" 
          isActive={activeFilter === "nutrition"}
          onClick={() => handleFilterChange("nutrition")}
        />
        <CategoryFilter 
          name="Fitness" 
          isActive={activeFilter === "fitness"}
          onClick={() => handleFilterChange("fitness")}
        />
        <CategoryFilter 
          name="Preventive Care" 
          isActive={activeFilter === "preventive-care"}
          onClick={() => handleFilterChange("preventive-care")}
        />
      </div>
      
      {/* Featured Blog Posts */}
      <FeaturedBlogs />
    </section>
  );
};

interface CategoryFilterProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryFilter = ({ name, isActive, onClick }: CategoryFilterProps) => {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default Community;
