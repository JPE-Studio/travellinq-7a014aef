
import { supabase } from "@/integrations/supabase/client";
import { BuddyConnection } from "@/types";

// Get current authenticated user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  return session?.session?.user.id || null;
}

// Get buddy connection between current user and another user
export const getBuddyConnection = async (buddyId: string): Promise<BuddyConnection | null> => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log("No authenticated user session found");
      return null;
    }
    
    if (userId === buddyId) {
      console.log("User and buddy are the same person, no connection needed");
      return null;
    }
    
    console.log(`Checking buddy connection between ${userId} and ${buddyId}`);
    
    const { data, error } = await supabase
      .from('buddy_connections')
      .select("*")
      .eq("user_id", userId)
      .eq("buddy_id", buddyId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching buddy connection:", error);
      throw error;
    }
    
    console.log("Buddy connection data:", data);
    return data as BuddyConnection | null;
  } catch (error) {
    console.error("Exception in getBuddyConnection:", error);
    return null;
  }
};

// Connect with a buddy
export const connectWithBuddy = async (buddyId: string): Promise<BuddyConnection> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("You must be logged in to connect with buddies");
  }
  
  if (userId === buddyId) {
    throw new Error("You cannot connect with yourself as a buddy");
  }
  
  const { data, error } = await supabase
    .from('buddy_connections')
    .insert({
      user_id: userId,
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
