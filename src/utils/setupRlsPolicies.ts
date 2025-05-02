
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  try {
    // First ensure RLS is enabled on all tables
    await enableRowLevelSecurity();
    
    // Call the setup_chat_policies function we created in SQL
    const { data, error } = await supabase.rpc('setup_chat_policies');
    
    if (error) {
      console.error("Error setting up RLS policies:", error);
      throw error;
    }
    
    console.log("RLS policies setup complete:", data);
    return { success: true };
  } catch (err) {
    console.error("Failed to setup RLS policies:", err);
    throw err;
  }
};

// Add a function to make Postgres tables available for real-time
export const setupRealtimeTables = async () => {
  try {
    // Use our new helper function to enable realtime for messages
    const { data, error } = await (supabase.rpc as any)('enable_realtime_for_table', {
      table_name: 'messages'
    });
    
    if (error) {
      console.error("Error setting up realtime for messages:", error);
      throw error;
    }
    
    console.log("Realtime setup complete:", data);
    return { success: true };
  } catch (err) {
    console.error("Failed to setup realtime:", err);
    throw err;
  }
};

// Add a function to ensure RLS is enabled on chat tables
export const enableRowLevelSecurity = async () => {
  try {
    // Enable RLS on all chat tables if not already enabled
    const tables = ["conversations", "conversation_participants", "messages"];
    
    for (const table of tables) {
      // Use execute_sql directly rather than through RPC
      try {
        await (supabase.rpc as any)('execute_sql', {
          sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;` 
        });
        console.log(`RLS enabled on ${table} table`);
      } catch (error: any) {
        // Ignore "already enabled" errors
        if (!error.message || !error.message.includes("already enabled")) {
          console.error(`Error enabling RLS on ${table}:`, error);
        } else {
          console.log(`RLS already enabled on ${table} table`);
        }
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error("Failed to enable RLS:", err);
    throw err;
  }
};

// Check if a table has RLS enabled using our new helper function
export const checkRlsStatus = async () => {
  try {
    // Use our new helper function to check RLS status
    const { data, error } = await (supabase.rpc as any)('check_rls_status');
    
    if (error) {
      console.error("Error checking RLS status:", error);
      throw error;
    }
    
    console.log("RLS status:", data);
    return data;
  } catch (err) {
    console.error("Failed to check RLS status:", err);
    throw err;
  }
};
