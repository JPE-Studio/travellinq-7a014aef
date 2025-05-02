
import { supabase } from "@/integrations/supabase/client";
import { BuddyConnection } from "@/types";
import { Database } from "@/integrations/supabase/types";

// Get buddy connection between current user and another user
export const getBuddyConnection = async (buddyId: string): Promise<BuddyConnection | null> => {
  // Get current user
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user.id) return null;
  
  const { data, error } = await supabase
    .from('buddy_connections')
    .select("*")
    .eq("user_id", session.session.user.id)
    .eq("buddy_id", buddyId)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching buddy connection:", error);
    throw error;
  }
  
  return data as BuddyConnection | null;
};

// Connect with a buddy
export const connectWithBuddy = async (buddyId: string): Promise<BuddyConnection> => {
  // Get current user
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user.id) throw new Error("You must be logged in to connect with buddies");
  
  const { data, error } = await supabase
    .from('buddy_connections')
    .insert({
      user_id: session.session.user.id,
      buddy_id: buddyId,
      notify_at_100km: true,
      notify_at_50km: true,
      notify_at_20km: true
    })
    .select("*")
    .single();
  
  if (error) {
    console.error("Error connecting with buddy:", error);
    throw error;
  }
  
  return data as BuddyConnection;
};

// Update buddy connection notification settings
export const updateBuddyNotificationSettings = async (
  buddyId: string, 
  settings: { 
    notify_at_100km?: boolean; 
    notify_at_50km?: boolean; 
    notify_at_20km?: boolean;
  }
): Promise<BuddyConnection> => {
  // Get current user
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user.id) throw new Error("You must be logged in to update connections");
  
  const { data, error } = await supabase
    .from('buddy_connections')
    .update(settings)
    .eq("user_id", session.session.user.id)
    .eq("buddy_id", buddyId)
    .select("*")
    .single();
  
  if (error) {
    console.error("Error updating buddy connection:", error);
    throw error;
  }
  
  return data as BuddyConnection;
};

// Disconnect from a buddy
export const disconnectBuddy = async (buddyId: string): Promise<void> => {
  // Get current user
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user.id) throw new Error("You must be logged in to disconnect buddies");
  
  const { error } = await supabase
    .from('buddy_connections')
    .delete()
    .eq("user_id", session.session.user.id)
    .eq("buddy_id", buddyId);
  
  if (error) {
    console.error("Error disconnecting buddy:", error);
    throw error;
  }
};
