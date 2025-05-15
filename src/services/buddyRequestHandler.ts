
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

// Accept buddy request
export const acceptBuddyRequest = async (buddyConnectionId: string): Promise<BuddyConnection> => {
  try {
    const { data, error } = await supabase
      .from('buddy_connections')
      .update({ status: 'active' })
      .eq('id', buddyConnectionId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return adaptBuddyConnection(data);
  } catch (error) {
    console.error('Error accepting buddy request:', error);
    throw error;
  }
};

// Decline buddy request - renamed from "decline" to "reject" for consistency
export const rejectBuddyRequest = async (buddyConnectionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('buddy_connections')
      .update({ status: 'rejected' })
      .eq('id', buddyConnectionId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error declining buddy request:', error);
    throw error;
  }
};
