
import { supabase } from "@/integrations/supabase/client";

// Get current authenticated user ID - shared utility function
export async function getCurrentUserId(): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  return session?.session?.user.id || null;
}
