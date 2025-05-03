
import { NotificationType } from '@/services/notifications/baseTypes';

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
  read: boolean;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  postId?: string;
  link?: string;
}
