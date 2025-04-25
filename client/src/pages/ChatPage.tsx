import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '../components/ui/spinner';

const ChatPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get current user
  const { data: currentUser, isLoading: isLoadingUser, error: userError } = useQuery<any>({
    queryKey: ['/api/users/current'],
  });
  
  // Parse appointment ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = parseInt(urlParams.get('appointmentId') || '0', 10);
  
  // Get appointment details
  const { data: appointment, isLoading: isLoadingAppointment, error: appointmentError } = useQuery<any>({
    queryKey: ['/api/appointments', appointmentId],
    enabled: !!appointmentId,
  });
  
  // States for doctor and patient information
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  
  // Fetch doctor and patient info
  useEffect(() => {
    if (appointment) {
      // Fetch doctor info
      fetch(`/api/doctors/${appointment.doctorId}`)
        .then(response => response.json())
        .then(data => {
          setDoctorInfo(data);
        })
        .catch(error => {
          console.error('Error fetching doctor:', error);
          toast({
            title: 'Error',
            description: 'Failed to load doctor information',
            variant: 'destructive',
          });
        });
      
      // Fetch patient info if current user is a doctor
      if (currentUser?.role === 'doctor') {
        fetch(`/api/users/${appointment.patientId}`)
          .then(response => response.json())
          .then(data => {
            setPatientInfo(data);
          })
          .catch(error => {
            console.error('Error fetching patient:', error);
            toast({
              title: 'Error',
              description: 'Failed to load patient information',
              variant: 'destructive',
            });
          });
      } else {
        setPatientInfo(currentUser);
      }
    }
  }, [appointment, currentUser, toast]);
  
  // Handle loading and errors
  if (isLoadingUser || isLoadingAppointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Spinner className="h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }
  
  if (userError || appointmentError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-destructive mb-4">Error loading chat</div>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-destructive mb-4">Please login to access the chat</div>
        <Button onClick={() => setLocation('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-destructive mb-4">Appointment not found</div>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  // Ensure we have necessary information for the chat
  if (!doctorInfo || !patientInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Spinner className="h-8 w-8 mb-4" />
        <p className="text-muted-foreground">Loading participants information...</p>
      </div>
    );
  }
  
  // Determine if current user is doctor or patient
  const isDoctor = currentUser.role === 'doctor';
  
  // Check if the user is authorized to view this chat
  const isAuthorized = isDoctor 
    ? doctorInfo.user?.id === currentUser.id 
    : patientInfo.id === currentUser.id;
  
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-destructive mb-4">You are not authorized to view this chat</div>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 mb-4" 
          onClick={() => setLocation('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">
          {isDoctor ? `Chat with ${patientInfo.fullName}` : `Chat with Dr. ${doctorInfo.user?.fullName}`}
        </h1>
        <p className="text-muted-foreground">
          Appointment on {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
        </p>
      </div>
      
      <ChatInterface 
        appointmentId={appointmentId}
        userId={currentUser.id}
        userType={isDoctor ? 'doctor' : 'patient'}
        doctorId={doctorInfo.id}
        patientId={patientInfo.id}
        doctorName={doctorInfo.user?.fullName}
        patientName={patientInfo.fullName}
        doctorAvatar={doctorInfo.user?.profileImage}
        patientAvatar={patientInfo.profileImage}
      />
    </div>
  );
};

export default ChatPage;