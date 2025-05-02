
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
    const { data: existingConversations, error: existingError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);
      
    if (existingError) {
      console.error("Error searching for existing conversation participants:", existingError);
      throw new Error("Failed to check for existing conversation: " + existingError.message);
    }
    
    // If we found some conversations for the current user, check if the other user is part of any of them
    if (existingConversations && existingConversations.length > 0) {
      const conversationIds = existingConversations.map(c => c.conversation_id);
      
      const { data: matchingConversation, error: matchError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", conversationIds)
        .maybeSingle();
      
      if (matchError) {
        console.error("Error checking for matching conversation:", matchError);
        throw new Error("Failed to check for common conversation: " + matchError.message);
      }
      
      // If we found a matching conversation, return it
      if (matchingConversation) {
        console.log("Found existing conversation:", matchingConversation.conversation_id);
        return matchingConversation.conversation_id;
      }
    }
    
    console.log("No existing conversation found, creating new one");
    
    // Create a new conversation
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating conversation:", createError);
      throw new Error("Failed to create conversation: " + createError.message);
    }
    
    const conversationId = newConversation.id;
    console.log("Created new conversation:", conversationId);
    
    // Add current user to conversation
    const { error: currentUserPartError } = await supabase
      .from("conversation_participants")
      .insert({
        conversation_id: conversationId,
        user_id: currentUserId
      });
    
    if (currentUserPartError) {
      console.error("Error adding current user to conversation:", currentUserPartError);
      // Clean up the conversation we just created
      await supabase.from("conversations").delete().eq("id", conversationId);
      throw new Error("Failed to add you to conversation: " + currentUserPartError.message);
    }
    
    // Add other user to conversation
    const { error: otherUserPartError } = await supabase
      .from("conversation_participants")
      .insert({
        conversation_id: conversationId,
        user_id: otherUserId
      });
    
    if (otherUserPartError) {
      console.error("Error adding other user to conversation:", otherUserPartError);
      // Clean up everything if adding the other user fails
      await supabase.from("conversation_participants").delete().eq("conversation_id", conversationId);
      await supabase.from("conversations").delete().eq("id", conversationId);
      throw new Error("Failed to add other user to conversation: " + otherUserPartError.message);
    }
    
    return conversationId;
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
    
  if (error) {
    console.error("Error fetching conversation participants:", error);
    throw new Error("Failed to get conversation participants: " + error.message);
  }
  
  return data.map(p => p.user_id);
};
