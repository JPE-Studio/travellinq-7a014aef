
import React from 'react';
import NotificationItem, { Notification } from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  loading?: boolean;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ 
  notifications, 
  onMarkAsRead,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationsList;
