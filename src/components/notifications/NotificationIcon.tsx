
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, MessageSquare, User } from 'lucide-react';
import { Notification } from './types';

interface NotificationIconProps {
  notification: Notification;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ notification }) => {
  if (notification.userId) {
    return (
      <Avatar className="h-10 w-10">
        <AvatarImage src={notification.userAvatar} />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    );
  }
  
  if (notification.type === 'message') {
    return (
      <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
        <MessageSquare className="h-6 w-6" />
      </div>
    );
  }
  
  return (
    <div className="rounded-full bg-primary/10 p-2 text-primary">
      <Bell className="h-6 w-6" />
    </div>
  );
};

export default NotificationIcon;
