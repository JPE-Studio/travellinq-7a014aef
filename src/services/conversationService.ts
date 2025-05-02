
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "./userService";

// Fetch a single conversation with all messages
export const fetchConversation = async (conversationId: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  try {
    // Check if the user is a participant in this conversation
    const { data: userParticipation, error: partError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userSession.session.user.id)
      .maybeSingle();
    
    if (partError) {
      console.error("Error checking participation:", partError);
      throw new Error("Failed to verify conversation access");
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
      throw new Error("Could not find conversation participant");
    }
    
    // Get all messages
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
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

// Fetch all conversations for the current user
export const fetchUserConversations = async () => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  try {
    // Get all conversations the user is participating in
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations:conversation_id (
          id, 
          created_at
        )
      `)
      .eq("user_id", userSession.session.user.id);
    
    if (partError) {
      console.error("Error fetching conversations:", partError);
      return [];
    }
    
    if (!participations || participations.length === 0) {
      return [];
    }
    
    // Process each conversation to get details
    const conversationsWithDetails = await Promise.all(
      participations.map(async (participation) => {
        const conversationId = participation.conversation_id;
        
        // Get the other participant
        const { data: otherParticipant, error: otherPartError } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conversationId)
          .neq("user_id", userSession.session.user.id)
          .single();
        
        if (otherPartError) {
          console.error("Error fetching other participant:", otherPartError);
          return null;
        }
        
        // Get the last message
        const { data: lastMessage, error: msgError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (msgError) {
          console.error("Error fetching last message:", msgError);
        }
        
        // Get other user profile
        let otherUserInfo = { 
          id: otherParticipant.user_id,
          pseudonym: "Unknown User",
          avatar: undefined
        };
        
        try {
          const otherUserProfile = await fetchUserProfile(otherParticipant.user_id);
          otherUserInfo = {
            id: otherParticipant.user_id,
            pseudonym: otherUserProfile.pseudonym || "Unknown User",
            avatar: otherUserProfile.avatar
          };
        } catch (err) {
          console.error("Error fetching other user profile:", err);
        }
        
        return {
          id: conversationId,
          otherUser: otherUserInfo,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: new Date(lastMessage.created_at),
            isFromCurrentUser: lastMessage.sender_id === userSession.session.user.id,
            read: lastMessage.read
          } : null
        };
      })
    );
    
    // Remove any null values from failed conversation processing
    return conversationsWithDetails.filter(Boolean);
  } catch (error) {
    console.error("Error in fetchUserConversations:", error);
    return [];
  }
};
