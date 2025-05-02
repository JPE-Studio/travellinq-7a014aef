
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { fetchUserProfile } from "./userService";

// Fetch all conversations for the current user
export const fetchUserConversations = async () => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  try {
    // First, find the conversations the user is part of without nesting queries
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userSession.session.user.id);
    
    if (participationsError) {
      console.error("Error fetching participations:", participationsError);
      return [];
    }
    
    if (!participations || participations.length === 0) {
      // No conversations found, return empty array without error
      return [];
    }
    
    const conversationIds = participations.map(p => p.conversation_id);
    
    // Fetch basic conversation data
    const { data: conversations, error: convoError } = await supabase
      .from("conversations")
      .select("id, created_at")
      .in("id", conversationIds);
    
    if (convoError) {
      console.error("Error fetching conversations:", convoError);
      return [];
    }
    
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
        
        if (msgError) {
          console.error("Error fetching messages:", msgError);
          return null;
        }
        
        // Get other participants in a separate query
        const { data: otherParticipants, error: participantError } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convo.id)
          .neq("user_id", userSession.session?.user.id);
          
        if (participantError) {
          console.error("Error fetching other participants:", participantError);
          return null;
        }
        
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
    
    // Filter out any null values from failed conversation processing
    return conversationsWithMessages.filter(Boolean);
  } catch (error) {
    console.error("Error in fetchUserConversations:", error);
    return []; // Return empty array instead of throwing to prevent UI errors
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
    // Step 1: First check if the users already have a conversation - using two separate queries
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
    
    // Step 3: Add participants one at a time to avoid the RLS recursion issue
    const { error: currentUserParticipantError } = await supabase
      .from("conversation_participants")
      .insert({ conversation_id: newConversation.id, user_id: currentUserId });
    
    if (currentUserParticipantError) throw currentUserParticipantError;
    
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
