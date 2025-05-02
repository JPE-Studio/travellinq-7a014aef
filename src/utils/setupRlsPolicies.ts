
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  try {
    // Use type assertion to bypass TypeScript's type checking
    const { data, error } = await (supabase.rpc as any)('setup_chat_policies', {});
    
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
    // Use type assertion to fix the TypeScript error
    const { error } = await (supabase.rpc as any)('supabase_functions.enable_realtime', {
      table_name: 'notifications'
    });
    
    if (error) {
      console.error("Error setting up realtime for notifications:", error);
      throw error;
    }
    
    return { success: true };
  } catch (err) {
    console.error("Failed to setup realtime:", err);
    throw err;
  }
};
