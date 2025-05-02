
import React from 'react';
import NotificationItem, { Notification } from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellRing } from 'lucide-react';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  loading?: boolean;
  maxHeight?: string;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ 
  notifications, 
  onMarkAsRead,
  loading = false,
  maxHeight = "400px"
}) => {
  // Group notifications by type for better organization
  const pendingRequests = notifications.filter(n => n.type === 'buddy_request' && !n.read);
  const otherNotifications = notifications.filter(n => n.type !== 'buddy_request' || n.read);

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
        <BellRing className="h-8 w-8 mx-auto mb-3 opacity-40" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }} className="overflow-y-auto">
      {pendingRequests.length > 0 && (
        <div className="border-b">
          <Alert className="m-2 mb-1">
            <BellRing className="h-4 w-4" />
            <AlertTitle>Connection Requests</AlertTitle>
            <AlertDescription>
              You have {pendingRequests.length} pending buddy {pendingRequests.length === 1 ? 'request' : 'requests'}
            </AlertDescription>
          </Alert>
          
          {pendingRequests.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      )}
      
      <div className="divide-y">
        {otherNotifications.map((notification) => (
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
