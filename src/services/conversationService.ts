
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "./userService";

// Fetch all conversations for the current user
export const fetchUserConversations = async () => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  try {
    console.log("Fetching conversations for user:", userSession.session.user.id);
    
    // Find the conversations the user is part of
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userSession.session.user.id);
    
    if (participationsError) {
      console.error("Error fetching participations:", participationsError);
      return [];
    }
    
    if (!participations || participations.length === 0) {
      console.log("No conversations found");
      return [];
    }
    
    const conversationIds = participations.map(p => p.conversation_id);
    console.log("Found conversation IDs:", conversationIds);
    
    // Fetch basic conversation data
    const { data: conversations, error: convoError } = await supabase
      .from("conversations")
      .select("id, created_at")
      .in("id", conversationIds);
    
    if (convoError) {
      console.error("Error fetching conversations:", convoError);
      return [];
    }
    
    console.log("Processing", conversations.length, "conversations");
    
    // Process each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (convo) => {
        // Get the last message
        const { data: messages, error: msgError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (msgError) {
          console.error("Error fetching messages for conversation", convo.id, ":", msgError);
          return null;
        }
        
        // Get other participants
        const { data: otherParticipants, error: participantError } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convo.id)
          .neq("user_id", userSession.session.user.id);
          
        if (participantError) {
          console.error("Error fetching participants for conversation", convo.id, ":", participantError);
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
              pseudonym: otherUserProfile.pseudonym || "Unknown User",
              avatar: otherUserProfile.avatar
            };
          } catch (err) {
            console.error("Error fetching profile for user", otherParticipantUserId, ":", err);
          }
        }
        
        const lastMessage = messages && messages.length > 0 ? messages[0] : null;
        
        return {
          id: convo.id,
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
    
    // Filter out any null values from failed conversation processing
    return conversationsWithDetails.filter(Boolean);
  } catch (error) {
    console.error("Error in fetchUserConversations:", error);
    return [];
  }
};

// Fetch a single conversation with all messages
export const fetchConversation = async (conversationId: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not authenticated");
  
  try {
    console.log("Fetching conversation:", conversationId);
    
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
    
    // Get basic conversation details
    const { data: conversation, error: convoError } = await supabase
      .from("conversations")
      .select("id, created_at")
      .eq("id", conversationId)
      .single();
    
    if (convoError) {
      console.error("Error fetching conversation:", convoError);
      throw convoError;
    }
    
    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId);
    
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
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
    
    // Find the other participant
    const otherParticipantId = participants.find(
      p => p.user_id !== userSession.session.user.id
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
      msg => !msg.read && msg.sender_id !== userSession.session.user.id
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
  } catch (error) {
    console.error("Error in fetchConversation:", error);
    throw error;
  }
};
