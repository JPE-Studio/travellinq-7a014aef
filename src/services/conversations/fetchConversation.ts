
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "../userService";

/**
 * Fetch a single conversation with all messages
 */
export const fetchConversation = async (conversationId: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  try {
    // Add a small delay to ensure any RPC transactions have completed
    // This helps prevent race conditions with RLS policies
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if the user is a participant in this conversation
    const { data: userParticipation, error: partError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userSession.session.user.id)
      .maybeSingle();
    
    if (partError) {
      console.error("Error checking participation:", partError);
      throw new Error("Failed to verify conversation access: " + partError.message);
    }
    
    if (!userParticipation) {
      console.error("User is not a participant in this conversation");
      throw new Error("You don't have access to this conversation");
    }
    
    // Get other participant
    const { data: otherParticipant, error: otherPartError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .neq("user_id", userSession.session.user.id)
      .single();
    
    if (otherPartError) {
      console.error("Error fetching other participant:", otherPartError);
      throw new Error("Could not find conversation participant: " + otherPartError.message);
    }
    
    // Get all messages
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw new Error("Failed to load messages: " + messagesError.message);
    }
    
    // Get other user profile
    let otherUser = null;
    try {
      otherUser = await fetchUserProfile(otherParticipant.user_id);
    } catch (err) {
      console.error("Error fetching other user profile:", err);
      throw new Error("Failed to load user information");
    }
    
    // Mark unread messages as read
    const unreadMessageIds = messages
      .filter(msg => !msg.read && msg.sender_id !== userSession.session.user.id)
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      await supabase
        .from("messages")
        .update({ read: true })
        .in("id", unreadMessageIds);
    }
    
    return {
      conversation: { id: conversationId },
      otherUser,
      currentUserId: userSession.session.user.id,
      messages: messages.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        read: msg.read
      }))
    };
  } catch (error) {
    console.error("Error in fetchConversation:", error);
    throw error;
  }
};
