
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
import NotificationsList from '@/components/notifications/NotificationsList';
import { Notification } from '@/components/notifications/types';
import { Button } from '@/components/ui/button';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToNotifications
} from '@/services/notificationService';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const notificationsData = await fetchNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Subscribe to new notifications
      const unsubscribe = subscribeToNotifications((notification) => {
        setNotifications(prev => [notification, ...prev]);
      });
      
      return unsubscribe;
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <PageLayout>
      <div className="flex-1 container px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <Button onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <NotificationsList 
            notifications={notifications} 
            onMarkAsRead={handleMarkAsRead} 
            loading={loading}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Notifications;
