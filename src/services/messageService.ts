
import { supabase } from "@/integrations/supabase/client";

// Send a new message
export const sendMessage = async (conversationId: string, content: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  try {
    console.log("Sending message to conversation:", conversationId);
    console.log("Content:", content);
    console.log("Sender:", userSession.session.user.id);

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
    
    console.log("Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Exception in sendMessage:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (messageIds: string[]) => {
  if (!messageIds || !messageIds.length) return;
  
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

// Get unread message count for current user
export const getUnreadMessageCount = async () => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) return 0;
  
  try {
    // First get all conversations the user is part of
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userSession.session.user.id);
    
    if (partError || !participations || !participations.length) return 0;
    
    // Then count unread messages in these conversations that were not sent by the current user
    const { count, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", participations.map(p => p.conversation_id))
      .neq("sender_id", userSession.session.user.id)
      .eq("read", false);
    
    if (countError) return 0;
    
    return count || 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};
