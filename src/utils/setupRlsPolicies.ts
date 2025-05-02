
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  try {
    // First ensure RLS is enabled on all tables
    await enableRowLevelSecurity();
    
    // Call the setup_chat_policies function we created in SQL
    // Use type assertion to bypass TypeScript's restricted types
    const { data, error } = await supabase.rpc('setup_chat_policies') as unknown as {
      data: any;
      error: any;
    };
    
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
    // Using a direct function call with type assertion to bypass TypeScript's type checking
    const { error } = await (supabase.rpc as any)('add_table_to_publication', {
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

// Add a function to ensure RLS is enabled on chat tables
export const enableRowLevelSecurity = async () => {
  try {
    // Enable RLS on all chat tables if not already enabled
    const tables = ["conversations", "conversation_participants", "messages"];
    
    for (const table of tables) {
      const { error } = await supabase.rpc(
        'execute_sql',
        { sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;` }
      ) as unknown as { error: any };
      
      if (error && !error.message.includes("already enabled")) {
        console.error(`Error enabling RLS on ${table}:`, error);
      } else {
        console.log(`RLS enabled on ${table} table`);
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error("Failed to enable RLS:", err);
    throw err;
  }
};

// Check if a table has RLS enabled
export const checkRlsStatus = async () => {
  try {
    const { data, error } = await supabase.from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['conversations', 'conversation_participants', 'messages']);
    
    if (error) {
      console.error("Error checking RLS status:", error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error("Failed to check RLS status:", err);
    throw err;
  }
};
