
import { supabase } from "@/integrations/supabase/client";

// This function can be called from your Admin settings or a one-time setup page
export const setupRlsPolicies = async () => {
  // Using the generic version of rpc to specify both return type and params type to fix TypeScript errors
  const { error } = await supabase.rpc<{ success: boolean }, Record<string, never>>(
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
