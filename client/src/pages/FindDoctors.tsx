import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DoctorsList from "@/components/doctors/DoctorsList";

const FindDoctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availability, setAvailability] = useState("");

  const handleSpecializationChange = (value: string) => {
    setSpecialization(value);
  };

  const handleAvailabilityChange = (value: string) => {
    setAvailability(value);
  };

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-md rounded-lg mt-8">
      <div className="border-b border-gray-200 pb-5 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Find Doctors</h2>
        <p className="mt-1 text-sm text-gray-500">
          Find and book appointments with qualified healthcare professionals
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 h-5 w-5" />
              </div>
              <Input
                type="text"
                id="search"
                className="pl-10"
                placeholder="Search by doctor name, specialty or condition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <Select value={specialization} onValueChange={handleSpecializationChange}>
              <SelectTrigger id="specialization">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="dermatology">Dermatology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="orthopedics">Orthopedics</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="psychiatry">Psychiatry</SelectItem>
                <SelectItem value="gynecology">Gynecology</SelectItem>
                <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <Select value={availability} onValueChange={handleAvailabilityChange}>
              <SelectTrigger id="availability">
                <SelectValue placeholder="Any Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="next_week">Next Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Doctors List */}
      <DoctorsList specialization={specialization} availability={availability} />
    </section>
  );
};

export default FindDoctors;
