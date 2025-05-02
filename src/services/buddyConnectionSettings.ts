
import { supabase } from "@/integrations/supabase/client";
import { BuddyConnection } from "@/types";
import { getCurrentUserId } from "./buddyUtils";

// Update buddy connection notification settings
export const updateBuddyNotificationSettings = async (
  buddyId: string, 
  settings: { 
    notify_at_100km?: boolean; 
    notify_at_50km?: boolean; 
    notify_at_20km?: boolean;
  }
): Promise<BuddyConnection> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("You must be logged in to update connections");
  }
  
  const { data, error } = await supabase
    .from('buddy_connections')
    .update(settings)
    .eq("user_id", userId)
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
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("You must be logged in to disconnect buddies");
  }
  
  const { error } = await supabase
    .from('buddy_connections')
    .delete()
    .eq("user_id", userId)
    .eq("buddy_id", buddyId);
  
  if (error) {
    console.error("Error disconnecting buddy:", error);
    throw error;
  }
};
