
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "../userService";

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
