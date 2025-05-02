
import { supabase } from "@/integrations/supabase/client";

// Send a new message
export const sendMessage = async (conversationId: string, content: string) => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  try {
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
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Exception in sendMessage:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (messageIds: string[]) => {
  if (!messageIds.length) return;
  
  try {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .in("id", messageIds);
      
    if (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  } catch (error) {
    console.error("Exception in markMessagesAsRead:", error);
    throw error;
  }
};
