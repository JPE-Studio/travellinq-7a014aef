
import { supabase } from '@/integrations/supabase/client';
import { BuddyConnection } from '@/types';
import { getCurrentUserId } from './buddyUtils';

// Converts database model to application model
const adaptBuddyConnection = (dbConnection: any): BuddyConnection => {
  return {
    id: dbConnection.id,
    userId: dbConnection.user_id,
    buddyId: dbConnection.buddy_id,
    status: dbConnection.status,
    createdAt: new Date(dbConnection.created_at),
    // Keep both naming conventions for compatibility
    user_id: dbConnection.user_id,
    buddy_id: dbConnection.buddy_id,
    created_at: dbConnection.created_at,
    notifyAt20km: dbConnection.notify_at_20km,
    notifyAt50km: dbConnection.notify_at_50km,
    notifyAt100km: dbConnection.notify_at_100km,
    notify_at_20km: dbConnection.notify_at_20km,
    notify_at_50km: dbConnection.notify_at_50km,
    notify_at_100km: dbConnection.notify_at_100km
  };
};

// Fetch buddy connection between current user and a specific user
export const fetchBuddyConnection = async (buddyId: string): Promise<BuddyConnection | null> => {
  try {
    const { data: userAuth } = await supabase.auth.getUser();
    if (!userAuth.user) throw new Error('User not authenticated');
    
    const userId = userAuth.user.id;
    
    const { data, error } = await supabase
      .from('buddy_connections')
      .select('*')
      .or(`user_id.eq.${userId},buddy_id.eq.${userId}`)
      .or(`user_id.eq.${buddyId},buddy_id.eq.${buddyId}`)
      .single();
    
    if (error) {
      // If error is 'No rows found', return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data ? adaptBuddyConnection(data) : null;
  } catch (error) {
    console.error('Error fetching buddy connection:', error);
    throw error;
  }
};

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
      return adaptBuddyConnection(data);
    }
    
    return null;
  } catch (error) {
    console.error("Exception in getBuddyConnection:", error);
    return null;
  }
};
