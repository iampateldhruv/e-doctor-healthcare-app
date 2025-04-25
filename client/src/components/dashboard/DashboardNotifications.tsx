import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  PillBottle, 
  MessageSquare
} from "lucide-react";

interface DashboardNotificationsProps {
  userId: number;
}

const DashboardNotifications = ({ userId }: DashboardNotificationsProps) => {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', userId],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    enabled: !!userId
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-md h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        <button className="text-sm text-primary hover:text-primary-600">View all</button>
      </div>

      <div className="space-y-4">
        {notifications && notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
              onMarkAsRead={() => markAsReadMutation.mutate(notification.id)}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No notifications at this time
          </div>
        )}
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50 border-l-4 border-primary';
      case 'prescription':
        return 'bg-emerald-50 border-l-4 border-secondary';
      case 'consultation':
        return 'bg-amber-50 border-l-4 border-accent';
      default:
        return 'bg-gray-50 border-l-4 border-gray-300';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="text-primary" />;
      case 'prescription':
        return <PillBottle className="text-secondary" />;
      case 'consultation':
        return <MessageSquare className="text-accent" />;
      default:
        return null;
    }
  };

  const getActionButtons = (type: string) => {
    switch (type) {
      case 'appointment':
        return (
          <>
            <Button size="sm" className="text-xs bg-primary text-white px-3 py-1 rounded-full mr-2">
              Confirm
            </Button>
            <Button size="sm" variant="outline" className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full">
              Reschedule
            </Button>
          </>
        );
      case 'prescription':
        return (
          <Button size="sm" className="text-xs bg-secondary text-white px-3 py-1 rounded-full mr-2">
            View Details
          </Button>
        );
      case 'consultation':
        return (
          <Button size="sm" className="text-xs bg-accent text-white px-3 py-1 rounded-full mr-2">
            Read Message
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${getNotificationBgColor(notification.type)} p-4 rounded-md`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">{notification.title}</p>
          <p className="text-sm text-gray-600">{notification.message}</p>
          <div className="mt-2">
            {getActionButtons(notification.type)}
          </div>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default DashboardNotifications;
