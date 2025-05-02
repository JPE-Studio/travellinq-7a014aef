
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Notification {
  id: string;
  type: 'mention' | 'reply' | 'vote' | 'subscription' | 'nearby';
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

  return (
    <Link 
      to={notification.link || '#'} 
      className={`block p-4 border-b hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
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
        </div>
        
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
        )}
      </div>
    </Link>
  );
};

export default NotificationItem;
