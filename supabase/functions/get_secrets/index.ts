
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// This edge function allows secure access to secrets stored in Supabase
serve(async (req) => {
  try {
    // Get the request body
    const { keys } = await req.json();
    
    if (!keys || !Array.isArray(keys)) {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Get the requested secrets
    const secrets: Record<string, string> = {};
    
    for (const key of keys) {
      secrets[key] = Deno.env.get(key) || '';
    }
    
    // Return the secrets
    return new Response(
      JSON.stringify(secrets),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get_secrets function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
})
