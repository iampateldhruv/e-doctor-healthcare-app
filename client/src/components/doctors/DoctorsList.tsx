import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Doctor } from "@/lib/types";
import { Star, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DoctorsListProps {
  specialization: string;
  availability: string;
}

const DoctorsList = ({ specialization, availability }: DoctorsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors', specialization],
    queryFn: async () => {
      const url = specialization && specialization !== 'all'
        ? `/api/doctors?specialization=${specialization}` 
        : '/api/doctors';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch doctors');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 w-full"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter doctors based on availability if selected
  const filteredDoctors = doctors?.filter(doctor => {
    if (!availability || availability === 'any') return true;
    return doctor.availability === availability;
  });

  // Pagination
  const totalPages = filteredDoctors ? Math.ceil(filteredDoctors.length / doctorsPerPage) : 0;
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors?.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'today':
        return <Badge className="absolute top-4 right-4 bg-green-100 text-green-800">Available Today</Badge>;
      case 'tomorrow':
        return <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-800">Available Tomorrow</Badge>;
      case 'this_week':
        return <Badge className="absolute top-4 right-4 bg-purple-100 text-purple-800">Available This Week</Badge>;
      case 'next_week':
        return <Badge className="absolute top-4 right-4 bg-orange-100 text-orange-800">Available Next Week</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="doctorsList">
        {currentDoctors && currentDoctors.map((doctor) => (
          <div 
            key={doctor.id} 
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300" 
            data-specialty={doctor.specialization}
          >
            <div className="relative">
              <img 
                className="h-48 w-full object-cover"
                src={doctor.user.profileImage || "https://via.placeholder.com/800x400"} 
                alt={`Dr. ${doctor.user.fullName} profile`}
              />
              {getAvailabilityBadge(doctor.availability)}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{doctor.user.fullName}</h3>
              <p className="text-sm text-primary mb-2">{doctor.specialization}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                <span>{doctor.hospital}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{doctor.rating} ({doctor.reviewCount} reviews)</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{doctor.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-900 font-medium">
                  Next Available: <span className="text-green-600">{doctor.nextAvailable}</span>
                </div>
                <Button className="bg-primary text-white py-1 px-4 rounded-md hover:bg-blue-600 transition duration-200">
                  Book
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button 
              variant="outline" 
              size="icon" 
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            {[...Array(totalPages)].map((_, i) => (
              <Button 
                key={i} 
                variant={currentPage === i + 1 ? "default" : "outline"}
                className={`relative inline-flex items-center px-4 py-2 border ${
                  currentPage === i + 1 
                    ? "border-primary bg-primary text-white" 
                    : "border-gray-300 bg-white text-gray-700"
                } text-sm font-medium hover:bg-gray-50`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            
            <Button 
              variant="outline" 
              size="icon" 
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      )}
    </>
  );
};

export default DoctorsList;
