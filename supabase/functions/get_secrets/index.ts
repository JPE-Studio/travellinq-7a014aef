
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// This edge function allows secure access to secrets stored in Supabase
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
  
  try {
    // Get the request body
    const body = await req.json().catch(() => ({}));
    const { keys } = body;
    
    if (!keys || !Array.isArray(keys)) {
      console.error("Invalid request format - keys not provided or not an array");
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    // Get the requested secrets
    const secrets: Record<string, string> = {};
    
    for (const key of keys) {
      const value = Deno.env.get(key);
      secrets[key] = value || '';
      console.log(`Retrieved secret for ${key}: ${value ? 'Value exists' : 'No value found'}`);
    }
    
    console.log(`Retrieved ${Object.keys(secrets).length} secrets`);
    
    // Return the secrets
    return new Response(
      JSON.stringify(secrets),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in get_secrets function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
})
