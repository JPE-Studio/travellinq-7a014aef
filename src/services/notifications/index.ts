
// Re-export all notification service functionality from individual modules
export { type Notification, type NotificationType } from './baseTypes';
export { fetchNotifications } from './fetchNotifications';
export { markNotificationAsRead, markAllNotificationsAsRead } from './notificationStatus';
export { handleBuddyRequest } from './buddyRequestHandler';
export { createMessageNotification } from './messageNotifications';
export { subscribeToNotifications } from './realtimeSubscription';
