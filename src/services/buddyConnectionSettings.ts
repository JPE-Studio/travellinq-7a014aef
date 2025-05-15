
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

// Update buddy notification settings
export const updateBuddyNotificationSettings = async (
  buddyId: string,
  settings: {
    notify_at_100km?: boolean;
    notify_at_50km?: boolean;
    notify_at_20km?: boolean;
  }
): Promise<BuddyConnection> => {
  try {
    const { data, error } = await supabase
      .from('buddy_connections')
      .update(settings)
      .eq('buddy_id', buddyId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return adaptBuddyConnection(data);
  } catch (error) {
    console.error('Error updating buddy notification settings:', error);
    throw error;
  }
};

// Disconnect from a buddy
export const disconnectBuddy = async (buddyId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('buddy_connections')
      .delete()
      .or(`buddy_id.eq.${buddyId},user_id.eq.${buddyId}`);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error disconnecting buddy:', error);
    throw error;
  }
};
