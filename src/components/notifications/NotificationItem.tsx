
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import NotificationIcon from './NotificationIcon';
import BuddyRequestNotification from './BuddyRequestNotification';
import { NotificationItemProps, Notification } from './types';

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
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
        <NotificationIcon notification={notification} />
        
        <div className="flex-1">
          <p className="text-sm text-foreground">{notification.message}</p>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </span>
          
          {notification.type === 'buddy_request' && (
            <BuddyRequestNotification 
              notification={notification} 
              onMarkAsRead={onMarkAsRead} 
            />
          )}
        </div>
        
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
        )}
      </Link>
    </div>
  );
};

export { type Notification };
export default NotificationItem;
