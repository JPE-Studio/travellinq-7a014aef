
import { supabase } from "@/integrations/supabase/client";
import { BuddyConnection } from "@/types";
import { getCurrentUserId } from "./buddyUtils";

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
    
    if (data) {
      return data as BuddyConnection;
    }
    
    return null;
  } catch (error) {
    console.error("Exception in getBuddyConnection:", error);
    return null;
  }
};
