
import { supabase } from "@/integrations/supabase/client";
import { acceptBuddyRequest, rejectBuddyRequest } from "../buddyRequestHandler";
import { markNotificationAsRead } from "./notificationStatus";

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
    } else {
      await rejectBuddyRequest(requesterId);
    }
    
    // Mark the notification as read
    await markNotificationAsRead(notificationId);
    
  } catch (error) {
    console.error(`Error ${action}ing buddy request:`, error);
    throw error;
  }
};
