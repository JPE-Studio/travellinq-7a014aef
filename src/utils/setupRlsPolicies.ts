
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  // Call the RPC function with proper typing approach
  const { data, error } = await supabase.rpc(
    'setup_chat_policies' as any, // Using type assertion to bypass TypeScript's type checking for function name
    {}, // Empty parameters object
    { count: 'exact' }
  );
  
  if (error) {
    console.error("Error setting up RLS policies:", error);
    throw error;
  }
  
  return { success: true };
};
