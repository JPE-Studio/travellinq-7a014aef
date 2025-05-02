
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  try {
    // Call the setup_chat_policies function we created in SQL
    const { data, error } = await supabase.rpc('setup_chat_policies');
    
    if (error) {
      console.error("Error setting up RLS policies:", error);
      throw error;
    }
    
    return { success: true };
  } catch (err) {
    console.error("Failed to setup RLS policies:", err);
    throw err;
  }
};

// Add a function to make Postgres tables available for real-time
export const setupRealtimeTables = async () => {
  try {
    // This will enable realtime for the messages table
    const { error } = await supabase.rpc('add_table_to_publication', {
      table_name: 'messages'
    });
    
    if (error) {
      console.error("Error setting up realtime for messages:", error);
      throw error;
    }
    
    return { success: true };
  } catch (err) {
    console.error("Failed to setup realtime:", err);
    throw err;
  }
};
