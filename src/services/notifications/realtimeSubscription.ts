
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "../userService";
import { Notification } from "./baseTypes";

/**
 * Sets up a real-time subscription for new notifications
 * @param callback Function to call when a new notification is received
 */
export const subscribeToNotifications = (
  callback: (notification: Notification) => void
) => {
  try {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        async (payload) => {
          const notification = payload.new as any;
          
          // Check if this notification is for the current user
          const { data: session } = await supabase.auth.getSession();
          if (!session.session || notification.user_id !== session.session.user.id) {
            return;
          }
          
          // If this notification has a related user, fetch their profile
          let userName, userAvatar;
          if (notification.related_user_id) {
            try {
              const userProfile = await fetchUserProfile(notification.related_user_id);
              userName = userProfile.pseudonym;
              userAvatar = userProfile.avatar;
            } catch (err) {
              console.error("Error fetching related user profile:", err);
            }
          }
          
          // Convert to application notification
          const appNotification: Notification = {
            id: notification.id,
            type: notification.type as Notification["type"],
            message: notification.message,
            createdAt: new Date(notification.created_at),
            read: notification.read,
            userId: notification.related_user_id,
            userName,
            userAvatar,
            postId: notification.post_id,
            link: notification.link || '#'
          };
          
          // Call the callback
          callback(appNotification);
        }
      )
      .subscribe();
      
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    throw error;
  }
};
