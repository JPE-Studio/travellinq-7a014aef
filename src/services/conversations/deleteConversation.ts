
import { supabase } from "@/integrations/supabase/client";

/**
 * Delete a conversation and all its messages
 */
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  try {
    // First check if the user is a participant in this conversation
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
    
    // Delete all messages in the conversation
    const { error: messagesError } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);
      
    if (messagesError) {
      console.error("Error deleting messages:", messagesError);
      throw new Error("Failed to delete messages: " + messagesError.message);
    }
    
    // Delete all participants from the conversation
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .delete()
      .eq("conversation_id", conversationId);
      
    if (participantsError) {
      console.error("Error deleting participants:", participantsError);
      throw new Error("Failed to delete participants: " + participantsError.message);
    }
    
    // Finally delete the conversation itself
    const { error: conversationError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);
      
    if (conversationError) {
      console.error("Error deleting conversation:", conversationError);
      throw new Error("Failed to delete conversation: " + conversationError.message);
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    throw error;
  }
};
