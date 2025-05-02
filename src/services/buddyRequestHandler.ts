
import { supabase } from "@/integrations/supabase/client";
import { BuddyConnection } from "@/types";
import { getCurrentUserId } from "./buddyUtils";

// Accept a buddy connection request
export const acceptBuddyRequest = async (requesterId: string): Promise<BuddyConnection> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("You must be logged in to accept connection requests");
  }
  
  // First, fetch the current record to ensure it exists
  const { data: existingConnection, error: fetchError } = await supabase
    .from('buddy_connections')
    .select("*")
    .eq("user_id", requesterId)
    .eq("buddy_id", userId)
    .eq("status", 'pending')
    .single();
  
  if (fetchError || !existingConnection) {
    console.error("Error fetching connection to accept:", fetchError);
    throw new Error("Connection request not found or already processed");
  }
  
  // Now update it using a properly typed update object
  const { data, error } = await supabase
    .from('buddy_connections')
    .update({ status: 'active' })
    .eq("id", existingConnection.id)
    .select("*")
    .single();
  
  if (error) {
    console.error("Error accepting buddy request:", error);
    throw error;
  }
  
  return data as BuddyConnection;
};

// Reject a buddy connection request
export const rejectBuddyRequest = async (requesterId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("You must be logged in to reject connection requests");
  }
  
  // First, fetch the current record to ensure it exists
  const { data: existingConnection, error: fetchError } = await supabase
    .from('buddy_connections')
    .select("*")
    .eq("user_id", requesterId)
    .eq("buddy_id", userId)
    .eq("status", 'pending')
    .single();
    
  if (fetchError || !existingConnection) {
    console.error("Error fetching connection to reject:", fetchError);
    throw new Error("Connection request not found or already processed");
  }
  
  // Now update it using a properly typed update object
  const { error } = await supabase
    .from('buddy_connections')
    .update({ status: 'rejected' })
    .eq("id", existingConnection.id);
  
  if (error) {
    console.error("Error rejecting buddy request:", error);
    throw error;
  }
};
