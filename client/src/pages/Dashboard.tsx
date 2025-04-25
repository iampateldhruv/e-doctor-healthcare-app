import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";
import DashboardNotifications from "@/components/dashboard/DashboardNotifications";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import RecentConsultations from "@/components/dashboard/RecentConsultations";

const Dashboard = () => {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 pb-5 mb-5">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="bg-white shadow rounded-lg p-6 mb-8 h-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded-lg p-6 h-96"></div>
            <div className="bg-white shadow rounded-lg p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-b border-gray-200 pb-5 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user.fullName}. Here's an overview of your health activities.
        </p>
      </div>

      {/* Dashboard Notifications */}
      <DashboardNotifications userId={user.id} />
      
      {/* Upcoming Appointments and Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingAppointments userId={user.id} />
        <RecentConsultations userId={user.id} />
      </div>
    </section>
  );
};

export default Dashboard;
