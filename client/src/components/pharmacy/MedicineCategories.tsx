import { Pill, Worm, PillBottle, Heart, Moon, MoreHorizontal } from "lucide-react";

const MedicineCategories = () => {
  const categories = [
    {
      name: "Pain Relief",
      icon: <Pill className="text-xl" />,
      color: "bg-blue-100 text-primary",
    },
    {
      name: "Cold & Flu",
      icon: <Worm className="text-xl" />,
      color: "bg-green-100 text-secondary",
    },
    {
      name: "Digestion",
      icon: <PillBottle className="text-xl" />,
      color: "bg-yellow-100 text-accent",
    },
    {
      name: "Heart Health",
      icon: <Heart className="text-xl" />,
      color: "bg-red-100 text-red-500",
    },
    {
      name: "Sleep & Stress",
      icon: <Moon className="text-xl" />,
      color: "bg-purple-100 text-purple-500",
    },
    {
      name: "View All",
      icon: <MoreHorizontal className="text-xl" />,
      color: "bg-gray-200 text-gray-600",
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Browse by Category</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <a
            key={index}
            href={`#category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="block bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition duration-200"
          >
            <div className={`w-12 h-12 mx-auto flex items-center justify-center ${category.color} rounded-full mb-3`}>
              {category.icon}
            </div>
            <span className="text-sm font-medium text-gray-800">{category.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default MedicineCategories;
