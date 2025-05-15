import { supabase } from '@/integrations/supabase/client';
import { BuddyConnection } from '@/types';

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

// Create buddy connection
export const createBuddyConnection = async (buddyId: string): Promise<BuddyConnection> => {
  try {
    const { data: userAuth } = await supabase.auth.getUser();
    if (!userAuth.user) throw new Error('User not authenticated');
    
    const userId = userAuth.user.id;
    
    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('buddy_connections')
      .select('*')
      .or(`user_id.eq.${userId},buddy_id.eq.${userId}`)
      .or(`user_id.eq.${buddyId},buddy_id.eq.${buddyId}`)
      .single();
    
    if (existingConnection) {
      return adaptBuddyConnection(existingConnection);
    }
    
    // Create new connection
    const { data, error } = await supabase
      .from('buddy_connections')
      .insert({
        user_id: userId,
        buddy_id: buddyId,
        status: 'pending'
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return adaptBuddyConnection(data);
  } catch (error) {
    console.error('Error creating buddy connection:', error);
    throw error;
  }
};

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
