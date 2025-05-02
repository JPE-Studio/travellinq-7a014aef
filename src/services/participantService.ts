
import { supabase } from "@/integrations/supabase/client";

// Create a new conversation or get existing one
export const getOrCreateConversation = async (otherUserId: string) => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  const currentUserId = userSession.session.user.id;
  
  try {
    // Step 1: First check if the users already have a conversation - using two separate queries
    // to avoid the recursion issues with RLS
    
    // Get all conversations the current user is part of
    const { data: myConversations, error: myConversationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);
    
    if (myConversationsError) throw myConversationsError;
    
    if (myConversations && myConversations.length > 0) {
      const myConversationIds = myConversations.map(p => p.conversation_id);
      
      // Check if the other user is part of any of these conversations
      const { data: sharedConversations, error: sharedConversationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", myConversationIds);
      
      if (sharedConversationsError) throw sharedConversationsError;
      
      if (sharedConversations && sharedConversations.length > 0) {
        // Found an existing conversation
        return sharedConversations[0].conversation_id;
      }
    }
    
    // Step 2: No existing conversation found, create a new one
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Step 3: Add participants - do each insertion separately to avoid recursive RLS issues
    // First add the current user
    const { error: currentUserParticipantError } = await supabase
      .from("conversation_participants")
      .insert({ conversation_id: newConversation.id, user_id: currentUserId });
    
    if (currentUserParticipantError) throw currentUserParticipantError;
    
    // Then add the other user
    const { error: otherUserParticipantError } = await supabase
      .from("conversation_participants")
      .insert({ conversation_id: newConversation.id, user_id: otherUserId });
    
    if (otherUserParticipantError) throw otherUserParticipantError;
    
    return newConversation.id;
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
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
