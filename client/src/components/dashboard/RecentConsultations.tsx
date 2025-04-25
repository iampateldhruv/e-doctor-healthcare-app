import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@/lib/types";
import { Calendar, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface RecentConsultationsProps {
  userId: number;
}

const RecentConsultations = ({ userId }: RecentConsultationsProps) => {
  const { data: consultations, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', userId, 'completed'],
    queryFn: async () => {
      const res = await fetch(`/api/appointments?userId=${userId}&role=patient&status=completed`);
      if (!res.ok) throw new Error('Failed to fetch consultations');
      return res.json();
    },
    enabled: !!userId
  });

  // For demo purposes, let's add some sample completed consultations
  const completedConsultations = [
    {
      id: 101,
      doctorName: "Dr. Mark Wilson",
      specialization: "General Physician",
      profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
      date: "April 30, 2023",
      time: "11:15 AM",
      status: "completed"
    },
    {
      id: 102,
      doctorName: "Dr. Emily Rodriguez",
      specialization: "Neurologist",
      profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
      date: "April 18, 2023",
      time: "3:45 PM",
      status: "completed"
    }
  ];

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Consultations</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="flex items-center mt-2">
                    <div className="h-4 bg-gray-200 rounded w-1/5 mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Consultations</h2>
      
      <div className="space-y-4">
        {completedConsultations.map((consultation) => (
          <div 
            key={consultation.id} 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex items-start">
              <img 
                className="h-12 w-12 rounded-full mr-4" 
                src={consultation.profileImage} 
                alt="Doctor profile" 
              />
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-800">
                  {consultation.doctorName}
                </h3>
                <p className="text-sm text-gray-600">
                  {consultation.specialization}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="flex items-center mr-3">
                    <Calendar size={12} className="mr-1" /> {consultation.date}
                  </span>
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" /> {consultation.time}
                  </span>
                </div>
              </div>
              <div>
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
              </div>
            </div>
            <div className="mt-3 flex justify-end space-x-2">
              <Button variant="outline" size="sm" className="text-xs">View Summary</Button>
              <Button className="text-xs bg-primary text-white px-3 py-1 rounded">Book Follow-up</Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <Button variant="outline" className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-200">
          View All History
        </Button>
      </div>
    </div>
  );
};

export default RecentConsultations;
