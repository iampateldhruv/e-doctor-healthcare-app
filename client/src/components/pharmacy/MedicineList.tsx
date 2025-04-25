import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Medicine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MedicineListProps {
  category?: string;
  type?: string;
}

const MedicineList = ({ category, type }: MedicineListProps) => {
  const { data: medicines, isLoading } = useQuery<Medicine[]>({
    queryKey: ['/api/medicines', category, type],
    queryFn: async () => {
      let url = '/api/medicines';
      if (category) url += `?category=${category}`;
      else if (type) url += `?type=${type}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch medicines');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 w-full"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Medications</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {medicines && medicines.map((medicine) => (
          <div 
            key={medicine.id} 
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            <div className="relative">
              <Link href={`/medicine/${medicine.id}`}>
                <a>
                  <img 
                    className="h-48 w-full object-contain p-4 bg-white" 
                    src={medicine.image || "https://via.placeholder.com/400"} 
                    alt={medicine.name} 
                  />
                </a>
              </Link>
              <Badge className="absolute top-4 left-4 bg-green-100 text-green-800">
                {medicine.type === 'prescription' ? 'Prescription' : 'Over-the-counter'}
              </Badge>
            </div>
            <div className="p-4">
              <div className="block">
                <Link href={`/medicine/${medicine.id}`}>
                  <a>
                    <h4 className="text-base font-medium text-gray-900">{medicine.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{medicine.dosage} | {medicine.count}</p>
                    <p className="text-xs text-gray-500 mt-2">{medicine.manufacturer}</p>
                  </a>
                </Link>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{medicine.price}</span>
                  <Button 
                    className="bg-primary text-white py-1 px-3 rounded-md text-sm hover:bg-blue-600 transition duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/cart/add?medicineId=${medicine.id}&qty=1`;
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button variant="outline" className="inline-block bg-white border border-gray-300 rounded-md px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          View All Medications
        </Button>
      </div>
    </div>
  );
};

export default MedicineList;
