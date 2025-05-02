
import { supabase } from "@/integrations/supabase/client";

/**
 * Get or create a conversation between the current user and another user
 */
export const getOrCreateConversation = async (otherUserId: string): Promise<string> => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) {
    throw new Error("User not authenticated");
  }
  
  const currentUserId = userSession.session.user.id;
  
  if (currentUserId === otherUserId) {
    throw new Error("Cannot create a conversation with yourself");
  }
  
  try {
    // First, try to find an existing conversation between these users
    const { data: existingConversation, error: existingError } = await supabase
      .rpc('find_conversation_between_users', { 
        current_user_id: currentUserId, 
        other_user_id: otherUserId 
      });
      
    if (existingError) {
      console.error("Error searching for existing conversation:", existingError);
      throw existingError;
    }
    
    // If we found an existing conversation, return it
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create a new conversation
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating conversation:", createError);
      throw createError;
    }
    
    // Add current user to conversation
    const { error: currentUserPartError } = await supabase
      .from("conversation_participants")
      .insert({
        conversation_id: newConversation.id,
        user_id: currentUserId
      });
    
    if (currentUserPartError) {
      console.error("Error adding current user to conversation:", currentUserPartError);
      throw currentUserPartError;
    }
    
    // Add other user to conversation
    const { error: otherUserPartError } = await supabase
      .from("conversation_participants")
      .insert({
        conversation_id: newConversation.id,
        user_id: otherUserId
      });
    
    if (otherUserPartError) {
      console.error("Error adding other user to conversation:", otherUserPartError);
      throw otherUserPartError;
    }
    
    return newConversation.id;
  } catch (error) {
    console.error("Exception in getOrCreateConversation:", error);
    throw error;
  }
};

/**
 * Get conversation participants
 */
export const getConversationParticipants = async (conversationId: string) => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);
    
  if (error) throw error;
  return data.map(p => p.user_id);
};
