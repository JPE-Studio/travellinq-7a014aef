
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { handleBuddyRequest } from '@/services/notificationService';
import { NotificationItemProps } from './types';

const BuddyRequestNotification: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
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

  // Only render actions if the notification is not read yet
  if (!notification.read) {
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

export default BuddyRequestNotification;
