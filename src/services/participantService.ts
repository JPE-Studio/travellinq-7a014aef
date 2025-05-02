
import { supabase } from "@/integrations/supabase/client";

// Get or create a conversation between the current user and another user
export const getOrCreateConversation = async (otherUserId: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  const currentUserId = userSession.session.user.id;
  
  if (currentUserId === otherUserId) {
    throw new Error("Cannot create a conversation with yourself");
  }
  
  try {
    console.log("Finding or creating conversation between", currentUserId, "and", otherUserId);
    
    // First check if a conversation already exists between these users
    // Get all conversations the current user is part of
    const { data: userConversations, error: userConvError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);
    
    if (userConvError) {
      console.error("Error fetching user conversations:", userConvError);
      throw userConvError;
    }
    
    if (userConversations && userConversations.length > 0) {
      // Get all conversations the other user is part of
      const { data: otherUserConversations, error: otherUserConvError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId);
      
      if (otherUserConvError) {
        console.error("Error fetching other user conversations:", otherUserConvError);
        throw otherUserConvError;
      }
      
      // Find common conversations
      if (otherUserConversations && otherUserConversations.length > 0) {
        const userConvIds = userConversations.map(c => c.conversation_id);
        const otherUserConvIds = otherUserConversations.map(c => c.conversation_id);
        
        const commonConversations = userConvIds.filter(id => otherUserConvIds.includes(id));
        
        if (commonConversations.length > 0) {
          console.log("Found existing conversation:", commonConversations[0]);
          return commonConversations[0];
        }
      }
    }
    
    // No existing conversation found, create a new one
    console.log("Creating new conversation");
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating conversation:", createError);
      throw createError;
    }
    
    console.log("New conversation created:", newConversation.id);
    
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
    
    console.log("Both users added to conversation");
    return newConversation.id;
  } catch (error) {
    console.error("Exception in getOrCreateConversation:", error);
    throw error;
  }
};

// Get conversation participants
export const getConversationParticipants = async (conversationId: string) => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);
    
  if (error) throw error;
  return data.map(p => p.user_id);
};
