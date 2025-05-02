
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Fetch all conversations for the current user
export const fetchUserConversations = async () => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  // Get conversation IDs where the user is a participant
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userSession.session.user.id);
  
  if (participationsError) throw participationsError;
  if (!participations.length) return [];
  
  // Get conversations with participants and last message
  const conversationIds = participations.map(p => p.conversation_id);
  
  // Get all conversations
  const { data: conversations, error: convoError } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      conversation_participants!inner (
        user_id,
        profiles:user_id (
          pseudonym,
          avatar
        )
      ),
      messages (
        id,
        content,
        sender_id,
        created_at,
        read
      )
    `)
    .in("id", conversationIds)
    .order("created_at", { foreignTable: "messages", ascending: false });
  
  if (convoError) throw convoError;
  
  // Get the other participant in each conversation
  return conversations.map(convo => {
    // Find the participant that isn't the current user
    const otherParticipant = convo.conversation_participants.find(
      p => p.user_id !== userSession.session?.user.id
    );
    
    // Get the last message if any exist
    const lastMessage = convo.messages && convo.messages.length > 0 
      ? convo.messages[0] 
      : null;
    
    // Extract user information
    const otherUser = otherParticipant?.profiles;
    
    return {
      id: convo.id,
      otherUser: {
        id: otherParticipant?.user_id,
        pseudonym: otherUser?.pseudonym || "Unknown User",
        avatar: otherUser?.avatar
      },
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        timestamp: new Date(lastMessage.created_at),
        isFromCurrentUser: lastMessage.sender_id === userSession.session?.user.id,
        read: lastMessage.read
      } : null
    };
  });
};

// Fetch a single conversation with all messages
export const fetchConversation = async (conversationId: string) => {
  const { data: userSession } = await supabase.auth.getSession();
  if (!userSession.session) throw new Error("User not authenticated");
  
  // Get conversation details with participants
  const { data: conversation, error: convoError } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      conversation_participants (
        user_id,
        profiles:user_id (
          id,
          pseudonym,
          avatar,
          bio
        )
      )
    `)
    .eq("id", conversationId)
    .single();
  
  if (convoError) throw convoError;
  
  // Get all messages
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  
  if (messagesError) throw messagesError;
  
  // Find the other participant
  const otherParticipant = conversation.conversation_participants.find(
    p => p.user_id !== userSession.session?.user.id
  );
  
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
    otherUser: otherParticipant?.profiles,
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
  
  // Check if a conversation already exists between these users
  const { data: existingParticipations, error: checkError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUserId);
  
  if (checkError) throw checkError;
  
  if (existingParticipations.length > 0) {
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
  await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: newConversation.id, user_id: currentUserId },
      { conversation_id: newConversation.id, user_id: otherUserId }
    ]);
  
  return newConversation.id;
};
