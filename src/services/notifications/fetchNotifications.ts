
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "./baseTypes";
import { fetchUserProfile } from "../userService";

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
      type: n.type as Notification["type"],
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
