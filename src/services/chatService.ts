
import { supabase } from "@/integrations/supabase/client";
import { BuddyConnection } from "@/types";

// Import individual services
export * from './conversationService';
export * from './messageService'; 
export * from './participantService';

// Buddy connection functions
export const connectWithBuddy = async (buddyId: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) {
    throw new Error("User not authenticated");
  }

  try {
    // Create connection data first
    const connectionData = {
      user_id: userSession.session.user.id,
      buddy_id: buddyId,
      notify_at_100km: true,
      notify_at_50km: true,
      notify_at_20km: true,
      created_at: new Date().toISOString()
    };
    
    // Use generic insert to avoid type errors
    const { data, error } = await supabase
      .from('buddy_connections')
      .upsert(connectionData)
      .select();
    
    if (error) throw error;
    
    // Cast to BuddyConnection type
    return data[0] as BuddyConnection;
  } catch (error) {
    console.error("Error connecting with buddy:", error);
    throw error;
  }
};

export const disconnectBuddy = async (buddyId: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) {
    throw new Error("User not authenticated");
  }

  try {
    const { error } = await supabase
      .from('buddy_connections')
      .delete()
      .eq("user_id", userSession.session.user.id)
      .eq("buddy_id", buddyId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error disconnecting buddy:", error);
    throw error;
  }
};

export const getBuddyConnection = async (buddyId: string) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('buddy_connections')
      .select()
      .eq("user_id", userSession.session.user.id)
      .eq("buddy_id", buddyId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data as BuddyConnection | null;
  } catch (error) {
    console.error("Error getting buddy connection:", error);
    return null;
  }
};

export const updateBuddyNotificationSettings = async (
  buddyId: string, 
  settings: { 
    notify_at_100km?: boolean; 
    notify_at_50km?: boolean; 
    notify_at_20km?: boolean;
  }
) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('buddy_connections')
      .update(settings)
      .eq("user_id", userSession.session.user.id)
      .eq("buddy_id", buddyId)
      .select();
    
    if (error) throw error;
    
    return data[0] as BuddyConnection;
  } catch (error) {
    console.error("Error updating buddy notification settings:", error);
    throw error;
  }
};
