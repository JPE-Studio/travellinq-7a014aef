
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import PageLayout from '@/components/PageLayout';
import NotificationsList from '@/components/notifications/NotificationsList';
import { Notification } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // This is a mock implementation - in a real app, you would fetch from your database
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'reply',
          message: 'Alex replied to your post about the campsite in Vienna',
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          userId: 'alex-id',
          userName: 'Alex',
          userAvatar: '',
          postId: 'post-1',
          link: '/post/post-1'
        },
        {
          id: '2',
          type: 'vote',
          message: 'Maria upvoted your post about the local restaurant',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          read: true,
          userId: 'maria-id',
          userName: 'Maria',
          userAvatar: '',
          postId: 'post-2',
          link: '/post/post-2'
        },
        {
          id: '3',
          type: 'nearby',
          message: 'John is within 2 miles of your location',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          read: false,
          userId: 'john-id',
          userName: 'John',
          userAvatar: '',
          link: '/profile/john-id'
        },
        {
          id: '4',
          type: 'subscription',
          message: 'There are 3 new replies to a post you\'re subscribed to',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          postId: 'post-3',
          link: '/post/post-3'
        },
        {
          id: '5',
          type: 'mention',
          message: 'Lisa mentioned you in a comment',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
          read: true,
          userId: 'lisa-id',
          userName: 'Lisa',
          userAvatar: '',
          postId: 'post-4',
          link: '/post/post-4'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    // In a real app, you would update the database
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = async () => {
    // In a real app, you would update the database
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast({
      title: "Success",
      description: "All notifications marked as read"
    });
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto p-4">
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
