import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface UpcomingAppointmentsProps {
  userId: number;
}

const UpcomingAppointments = ({ userId }: UpcomingAppointmentsProps) => {
  const [, setLocation] = useLocation();
  
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', userId, 'patient'],
    queryFn: async () => {
      const res = await fetch(`/api/appointments?userId=${userId}&role=patient`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
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

  // Function to get badge color based on appointment status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
      
      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start">
                <img 
                  className="h-12 w-12 rounded-full mr-4" 
                  src={appointment.doctor?.user.profileImage || "https://via.placeholder.com/48"} 
                  alt="Doctor profile" 
                />
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-800">
                    {appointment.doctor?.user.fullName || "Doctor Name"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appointment.doctor?.specialization || "Specialist"}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span className="flex items-center mr-3">
                      <Calendar size={12} className="mr-1" /> {appointment.date}
                    </span>
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" /> {appointment.time}
                    </span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
              <div className="mt-3 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setLocation(`/chat?appointmentId=${appointment.id}`)}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Button>
                <Button variant="outline" size="sm" className="text-xs">Cancel</Button>
                <Button variant="outline" size="sm" className="text-xs">Reschedule</Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No upcoming appointments
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <Button 
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          onClick={() => setLocation('/appointment/new')}
        >
          Book New Appointment
        </Button>
      </div>
    </div>
  );
};

export default UpcomingAppointments;
