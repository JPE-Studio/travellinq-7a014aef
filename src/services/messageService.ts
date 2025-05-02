
import { supabase } from "@/integrations/supabase/client";

// Send a new message
export const sendMessage = async (conversationId: string, content: string) => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userSession.session.user.id,
      content
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Mark messages as read
export const markMessagesAsRead = async (messageIds: string[]) => {
  if (!messageIds.length) return;
  
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .in("id", messageIds);
    
  if (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};
