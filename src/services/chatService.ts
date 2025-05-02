
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
  const channel = supabase
    .channel(`messages-channel-${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      console.log("New message received:", payload);
      onNewMessage(payload.new);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
