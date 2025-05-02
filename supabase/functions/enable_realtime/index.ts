
// supabase/functions/enable_realtime/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Enable realtime for the notifications table
    const { body } = req;
    const { table_name } = await body.json();
    
    // Run SQL to enable realtime for the table
    const { error } = await supabaseAdmin.rpc('supabase_functions.alter_table_replica_identity', {
      table_name: table_name
    });

    if (error) {
      console.error("Error setting replica identity:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Add table to realtime publication
    const { error: pubError } = await supabaseAdmin.rpc('supabase_functions.add_table_to_publication', {
      table_name: table_name
    });

    if (pubError) {
      console.error("Error adding table to publication:", pubError);
      return new Response(
        JSON.stringify({ error: pubError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error enabling realtime:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
