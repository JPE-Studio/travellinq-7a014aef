
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, User, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { handleBuddyRequest } from '@/services/notificationService';

export interface Notification {
  id: string;
  type: 'mention' | 'reply' | 'vote' | 'subscription' | 'nearby' | 'buddy_request' | 'comment_on_same_post';
  message: string;
  createdAt: Date;
  read: boolean;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  postId?: string;
  link?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };
  
  // Handle buddy request actions
  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notification.userId) return;
    
    try {
      await handleBuddyRequest(notification.userId, 'accept', notification.id);
      onMarkAsRead(notification.id);
    } catch (error) {
      console.error("Error accepting buddy request:", error);
    }
  };
  
  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notification.userId) return;
    
    try {
      await handleBuddyRequest(notification.userId, 'reject', notification.id);
      onMarkAsRead(notification.id);
    } catch (error) {
      console.error("Error rejecting buddy request:", error);
    }
  };

  // Render notification actions based on type
  const renderActions = () => {
    if (notification.type === 'buddy_request' && !notification.read) {
      return (
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800"
            onClick={handleAccept}
          >
            <Check className="h-4 w-4 mr-1 text-green-600" />
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800"
            onClick={handleReject}
          >
            <X className="h-4 w-4 mr-1 text-red-600" />
            Decline
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={`block p-4 border-b hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={handleClick}
    >
      <Link 
        to={notification.link || '#'} 
        className="flex items-start gap-3"
        onClick={(e) => notification.type === 'buddy_request' ? e.preventDefault() : handleClick()}
      >
        {notification.userId ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.userAvatar} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Bell className="h-6 w-6" />
          </div>
        )}
        
        <div className="flex-1">
          <p className="text-sm text-foreground">{notification.message}</p>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </span>
          
          {renderActions()}
        </div>
        
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
        )}
      </Link>
    </div>
  );
};

export default NotificationItem;
