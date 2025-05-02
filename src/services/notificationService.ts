import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/components/notifications/NotificationItem";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { fetchUserProfile } from "./userService";
import { acceptBuddyRequest, rejectBuddyRequest } from "./chatService";

/**
 * Fetches all notifications for the current user
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("User not authenticated");
    
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    if (!notifications || notifications.length === 0) return [];
    
    // Get unique related user IDs
    const userIds = notifications
      .filter(n => n.related_user_id)
      .map(n => n.related_user_id)
      .filter((id, index, self) => id && self.indexOf(id) === index) as string[];
    
    // Fetch user profiles in one batch
    const userProfiles: Record<string, any> = {};
    
    for (const userId of userIds) {
      try {
        const userProfile = await fetchUserProfile(userId);
        userProfiles[userId] = userProfile;
      } catch (err) {
        console.error(`Error fetching profile for user ${userId}:`, err);
      }
    }
    
    // Transform the database notifications to application notifications
    return notifications.map(n => ({
      id: n.id,
      type: n.type as "mention" | "reply" | "vote" | "subscription" | "nearby" | "buddy_request" | "comment_on_same_post" | "message",
      message: n.message,
      createdAt: new Date(n.created_at),
      read: n.read,
      userId: n.related_user_id,
      userName: n.related_user_id ? userProfiles[n.related_user_id]?.pseudonym : undefined,
      userAvatar: n.related_user_id ? userProfiles[n.related_user_id]?.avatar : undefined,
      postId: n.post_id,
      link: n.link || '#'
    }));
    
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Marks a notification as read
 * @param notificationId ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
      
    if (error) throw error;
    
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Marks all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", session.session.user.id);
      
    if (error) throw error;
    
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Handle a buddy connection request notification
 * @param requesterId ID of the user who sent the request
 * @param action 'accept' or 'reject'
 * @param notificationId ID of the notification to mark as read
 */
export const handleBuddyRequest = async (
  requesterId: string,
  action: 'accept' | 'reject',
  notificationId: string
): Promise<void> => {
  try {
    if (action === 'accept') {
      await acceptBuddyRequest(requesterId);
      toast({
        title: "Connection accepted",
        description: "You are now connected as buddies.",
      });
    } else {
      await rejectBuddyRequest(requesterId);
      toast({
        title: "Connection rejected",
        description: "The buddy request has been declined."
      });
    }
    
    // Mark the notification as read
    await markNotificationAsRead(notificationId);
    
  } catch (error) {
    console.error(`Error ${action}ing buddy request:`, error);
    toast({
      variant: "destructive",
      title: `Failed to ${action} connection`,
      description: error instanceof Error ? error.message : "An error occurred",
    });
    throw error;
  }
};

/**
 * Creates a notification for a new message
 * @param senderId ID of the user who sent the message
 * @param recipientId ID of the user receiving the message
 * @param conversationId ID of the conversation
 * @param messagePreview Preview of the message content
 */
export const createMessageNotification = async (
  senderId: string,
  recipientId: string,
  conversationId: string,
  messagePreview: string
): Promise<void> => {
  try {
    // Get sender profile to include their name
    const senderProfile = await fetchUserProfile(senderId);
    
    // Create notification in the database
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: recipientId,
        type: "message",
        message: `${senderProfile.pseudonym}: ${messagePreview}`,
        related_user_id: senderId,
        link: `/chat/${conversationId}`,
        read: false
      });
      
    if (error) throw error;
    
  } catch (error) {
    console.error("Error creating message notification:", error);
    throw error;
  }
};

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
            type: notification.type as "mention" | "reply" | "vote" | "subscription" | "nearby" | "buddy_request" | "comment_on_same_post" | "message",
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
          
          // Show toast notification with specific messages based on type
          let toastTitle = "New notification";
          let toastDescription = notification.message;
          
          if (notification.type === 'reply') {
            toastTitle = "New Reply";
            // Keep the default description which includes who replied
          } else if (notification.type === 'message') {
            toastTitle = "New Message";
            // Keep the default description which includes the message preview
          } else if (notification.type === 'buddy_request') {
            toastTitle = "New Connection Request";
            // Keep the default description
          }
          
          toast({
            title: toastTitle,
            description: toastDescription,
          });
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
