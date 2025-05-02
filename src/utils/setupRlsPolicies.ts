
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  // Using the generic version of rpc to specify the return type and avoid TypeScript errors
  const { error } = await supabase.rpc<{ success: boolean }>(
    'setup_chat_policies',
    {},
    { count: 'exact' }
  );
  
  if (error) {
    console.error("Error setting up RLS policies:", error);
    throw error;
  }
  
  return { success: true };
};
