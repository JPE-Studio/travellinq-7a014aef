
// This file is now just re-exporting from the refactored modules
// for backward compatibility
export {
  type Notification,
  type NotificationType,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  handleBuddyRequest,
  createMessageNotification,
  subscribeToNotifications
} from './notifications';
