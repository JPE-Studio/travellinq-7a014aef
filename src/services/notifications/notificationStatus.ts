
import { supabase } from "@/integrations/supabase/client";

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
