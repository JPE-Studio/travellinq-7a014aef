
import { supabase } from "@/integrations/supabase/client";
import { BuddyConnection } from "@/types";
import { getCurrentUserId } from "./buddyUtils";

// Connect with a buddy (now sends a pending request rather than directly connecting)
export const connectWithBuddy = async (buddyId: string): Promise<BuddyConnection> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("You must be logged in to connect with buddies");
  }
  
  if (userId === buddyId) {
    throw new Error("You cannot connect with yourself as a buddy");
  }
  
  // Create connection data with proper typing
  const connectionData = {
    user_id: userId,
    buddy_id: buddyId,
    status: 'pending',
    notify_at_100km: true,
    notify_at_50km: true,
    notify_at_20km: true
  };
  
  const { data, error } = await supabase
    .from('buddy_connections')
    .insert(connectionData)
    .select("*")
    .single();
  
  if (error) {
    console.error("Error connecting with buddy:", error);
    throw error;
  }
  
  return data as BuddyConnection;
};
