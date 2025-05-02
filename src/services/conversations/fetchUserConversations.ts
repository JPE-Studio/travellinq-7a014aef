
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "../userService";

/**
 * Fetch all conversations for the current user
 */
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
      .eq("user_id", userSession.session.user.id)
      .order("conversations(created_at)", { ascending: false });  // Order by conversation created_at
    
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
          id: otherParticipant?.user_id,
          pseudonym: "Unknown User",
          avatar: undefined
        };
        
        try {
          if (otherParticipant) {
            const otherUserProfile = await fetchUserProfile(otherParticipant.user_id);
            otherUserInfo = {
              id: otherParticipant.user_id,
              pseudonym: otherUserProfile.pseudonym || "Unknown User",
              avatar: otherUserProfile.avatar
            };
          }
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
    const validConversations = conversationsWithDetails.filter(Boolean);
    
    // Sort by last message timestamp (newest first)
    return validConversations.sort((a, b) => {
      // If a conversation doesn't have a last message, consider it older
      if (!a.lastMessage && !b.lastMessage) {
        return 0;
      }
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      
      // Sort by timestamp (newer first)
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
    });
  } catch (error) {
    console.error("Error in fetchUserConversations:", error);
    return [];
  }
};
