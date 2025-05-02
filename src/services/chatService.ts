
// Re-export all buddy connection related functions from their respective files
export { getBuddyConnection } from './buddyConnectionQueries';
export { connectWithBuddy } from './buddyConnectionCreate';
export { acceptBuddyRequest, rejectBuddyRequest } from './buddyRequestHandler';
export { updateBuddyNotificationSettings, disconnectBuddy } from './buddyConnectionSettings';
export { getCurrentUserId } from './buddyUtils';

// Import supabase client
import { supabase } from "@/integrations/supabase/client";

// Real-time chat subscription utility
export const setupChatSubscription = (conversationId: string, onNewMessage: (message: any) => void) => {
  console.log(`Setting up realtime subscription for conversation: ${conversationId}`);
  
  const channel = supabase
    .channel(`messages-channel-${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      console.log("New message received via realtime:", payload);
      onNewMessage(payload.new);
    })
    .subscribe((status) => {
      console.log(`Realtime subscription status for conversation ${conversationId}:`, status);
    });
    
  return () => {
    console.log(`Removing realtime subscription for conversation: ${conversationId}`);
    supabase.removeChannel(channel);
  };
};

// Checking if a user can access a conversation
export const canAccessConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // This query will fail if the user doesn't have access due to RLS
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .single();
      
    if (error) {
      console.error("Error checking conversation access:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception in canAccessConversation:", error);
    return false;
  }
};
