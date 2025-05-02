
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  try {
    // Call the RPC function without type constraints
    const { data, error } = await supabase.rpc('setup_chat_policies', {});
    
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
