import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Doctor, User } from '@/lib/types';
import { cn } from '@/lib/utils';

// Available appointment time slots
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM'
];

// Form schema
const formSchema = z.object({
  date: z.date({
    required_error: 'Please select a date',
  }),
  time: z.string({
    required_error: 'Please select a time slot',
  }),
  reason: z.string().min(5, {
    message: 'Reason must be at least 5 characters',
  }).max(500, {
    message: 'Reason must not exceed 500 characters',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const AppointmentBookingPage = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Extract doctorId from URL query params
  const params = new URLSearchParams(window.location.search);
  const doctorId = params.get('doctorId');
  
  // Redirect if no doctorId is provided
  useEffect(() => {
    if (!doctorId) {
      navigate('/doctors');
      toast({
        title: 'Error',
        description: 'Doctor ID is required to book an appointment',
        variant: 'destructive',
      });
    }
  }, [doctorId, navigate, toast]);
  
  // Fetch doctor details
  const { data: doctor, isLoading: isLoadingDoctor } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${doctorId}`],
    enabled: !!doctorId,
  });
  
  // Fetch current user
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
    },
  });
  
  // Book appointment mutation
  const bookAppointment = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: parseInt(doctorId!),
          patientId: user?.id,
          date: format(values.date, 'yyyy-MM-dd'),
          time: values.time,
          reason: values.reason,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: 'Success',
        description: 'Your appointment has been booked successfully',
      });
      // Navigate to chat page with the new appointment ID
      navigate(`/chat?appointmentId=${data.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to book the appointment. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    bookAppointment.mutate(values);
  };
  
  if (isLoadingDoctor || isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Book an Appointment</h1>
        
        {doctor && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Doctor Details</CardTitle>
              <CardDescription>You are booking an appointment with:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                {doctor.user.profileImage && (
                  <img 
                    src={doctor.user.profileImage} 
                    alt={doctor.user.fullName} 
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold">{doctor.user.fullName}</h3>
                  <p className="text-muted-foreground capitalize">{doctor.specialization}</p>
                  <p className="text-sm">{doctor.hospital}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-amber-500 mr-1">★</span>
                    <span>{doctor.rating}</span>
                    <span className="text-muted-foreground ml-1">({doctor.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Select a date and time for your appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                // Disable dates in the past and weekends
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const day = date.getDay();
                                return date < today || day === 0 || day === 6;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {slot}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Visit</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your symptoms or reason for consultation"
                          className="resize-none"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/doctors')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={bookAppointment.isPending}
                  >
                    {bookAppointment.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⊚</span>
                        Booking...
                      </>
                    ) : 'Book Appointment'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <p>You can reschedule or cancel your appointment up to 24 hours before the scheduled time.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;