
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a new message to a conversation
 */
export const sendMessage = async (conversationId: string, content: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) {
    throw new Error("User not authenticated");
  }
  
  try {
    // First verify that the user has access to this conversation
    const { data: access, error: accessError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userSession.session.user.id)
      .maybeSingle();
      
    if (accessError) {
      console.error("Error checking conversation access:", accessError);
      throw new Error("Failed to verify conversation access: " + accessError.message);
    }
    
    if (!access) {
      throw new Error("You don't have access to this conversation");
    }
    
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userSession.session.user.id,
        content
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message: " + error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Exception in sendMessage:", error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (messageIds: string[]) => {
  if (!messageIds || !messageIds.length) return;
  
  try {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .in("id", messageIds);
      
    if (error) {
      console.error("Error marking messages as read:", error);
      throw new Error("Failed to mark messages as read: " + error.message);
    }
  } catch (error) {
    console.error("Exception in markMessagesAsRead:", error);
    throw error;
  }
};

/**
 * Get unread message count for current user
 */
export const getUnreadMessageCount = async () => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) return 0;
  
  try {
    // Get all conversations the user is part of
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userSession.session.user.id);
    
    if (partError || !participations || !participations.length) return 0;
    
    // Count unread messages in these conversations not sent by current user
    const { count, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", participations.map(p => p.conversation_id))
      .neq("sender_id", userSession.session.user.id)
      .eq("read", false);
    
    if (countError) {
      console.error("Error counting unread messages:", countError);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};
