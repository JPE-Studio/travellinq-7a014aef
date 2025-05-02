
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { fetchUserProfile } from "./userService";

// Fetch all conversations for the current user
export const fetchUserConversations = async () => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  try {
    // Get conversation IDs where the user is a participant - directly from the database
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userSession.session.user.id);
    
    if (participationsError) throw participationsError;
    if (!participations?.length) return [];
    
    const conversationIds = participations.map(p => p.conversation_id);
    
    // Fetch basic conversation data without nesting relations to avoid recursion
    const { data: conversations, error: convoError } = await supabase
      .from("conversations")
      .select("id, created_at")
      .in("id", conversationIds);
    
    if (convoError) throw convoError;
    
    // For each conversation, get the other participants separately
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (convo) => {
        // Get the last message
        const { data: messages, error: msgError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (msgError) throw msgError;
        
        // Get the other participants separately
        const { data: otherParticipants, error: participantError } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convo.id)
          .neq("user_id", userSession.session?.user.id);
          
        if (participantError) throw participantError;
        
        const otherParticipantUserId = otherParticipants?.[0]?.user_id;
        
        let otherUserInfo = {
          id: otherParticipantUserId,
          pseudonym: "Unknown User",
          avatar: undefined
        };
        
        // Get other user's profile information
        if (otherParticipantUserId) {
          try {
            const otherUserProfile = await fetchUserProfile(otherParticipantUserId);
            otherUserInfo = {
              id: otherParticipantUserId,
              pseudonym: otherUserProfile.pseudonym,
              avatar: otherUserProfile.avatar
            };
          } catch (err) {
            console.error("Error fetching other user profile:", err);
          }
        }
        
        const lastMessage = messages && messages.length > 0 
          ? messages[0] 
          : null;
        
        return {
          id: convo.id,
          otherUser: otherUserInfo,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: new Date(lastMessage.created_at),
            isFromCurrentUser: lastMessage.sender_id === userSession.session?.user.id,
            read: lastMessage.read
          } : null
        };
      })
    );
    
    return conversationsWithMessages;
  } catch (error) {
    console.error("Error in fetchUserConversations:", error);
    throw error;
  }
};

// Fetch a single conversation with all messages
export const fetchConversation = async (conversationId: string) => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  // Get basic conversation details
  const { data: conversation, error: convoError } = await supabase
    .from("conversations")
    .select("id, created_at")
    .eq("id", conversationId)
    .single();
  
  if (convoError) throw convoError;
  
  // Get participants separately
  const { data: participants, error: participantsError } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);
  
  if (participantsError) throw participantsError;
  
  // Get all messages
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  
  if (messagesError) throw messagesError;
  
  // Find the other participant
  const otherParticipantId = participants.find(
    p => p.user_id !== userSession.session?.user.id
  )?.user_id;
  
  let otherUser = null;
  if (otherParticipantId) {
    try {
      otherUser = await fetchUserProfile(otherParticipantId);
    } catch (err) {
      console.error("Error fetching other user profile:", err);
    }
  }
  
  // Mark unread messages as read
  const unreadMessages = messages.filter(
    msg => !msg.read && msg.sender_id !== userSession.session?.user.id
  );
  
  if (unreadMessages.length > 0) {
    await supabase
      .from("messages")
      .update({ read: true })
      .in("id", unreadMessages.map(msg => msg.id));
  }
  
  return {
    conversation,
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
};

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

// Create a new conversation or get existing one
export const getOrCreateConversation = async (otherUserId: string) => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  const currentUserId = userSession.session.user.id;
  
  try {
    // Check if a conversation already exists between these users - using direct queries
    const { data: existingParticipations, error: checkError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId);
    
    if (checkError) throw checkError;
    
    if (existingParticipations?.length > 0) {
      const conversationIds = existingParticipations.map(p => p.conversation_id);
      
      const { data: otherUserParticipations, error: otherUserError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", conversationIds);
      
      if (otherUserError) throw otherUserError;
      
      if (otherUserParticipations && otherUserParticipations.length > 0) {
        // Found an existing conversation
        return otherUserParticipations[0].conversation_id;
      }
    }
    
    // No conversation exists, create a new one
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single();
    
    if (createError) throw createError;
    
    // Add both users as participants
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: otherUserId }
      ]);
    
    if (participantsError) throw participantsError;
    
    return newConversation.id;
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    throw error;
  }
};
