
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  // Call the RPC function with a more compatible typing approach
  const { data, error } = await supabase.rpc(
    'setup_chat_policies', // Function name
    {}, // Empty parameters object
    { count: 'exact' }
  );
  
  if (error) {
    console.error("Error setting up RLS policies:", error);
    throw error;
  }
  
  return { success: true };
};
