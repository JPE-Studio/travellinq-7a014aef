
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NotificationsList from './NotificationsList';
import { Notification } from './NotificationItem';
import { toast } from '@/components/ui/use-toast';

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // This is a mock implementation - in a real app, you would fetch from your database
      // For now, we'll create some sample notifications
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
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
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
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    // In a real app, you would update the database
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    // In a real app, you would update the database
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast({
      title: "Success",
      description: "All notifications marked as read"
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.some(n => !n.read) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <NotificationsList 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead}
          loading={loading} 
        />
        
        <div className="p-2 border-t">
          <Link 
            to="/notifications" 
            className="block text-center text-sm text-primary hover:underline p-2"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
