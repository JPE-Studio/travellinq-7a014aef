
// register-push-token/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    // Get the JWT from the request to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Invalid token or user not found:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the token data from the request body
    const body = await req.json();
    const { token, platform, enabled = true } = body;
    
    if (!token || !platform) {
      console.error('Missing token or platform');
      return new Response(
        JSON.stringify({ error: 'Missing token or platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Special case: disabling notifications
    if (token === 'disable' || enabled === false) {
      const { error: disableError } = await supabaseClient
        .from('push_notification_tokens')
        .update({ enabled: false })
        .eq('user_id', user.id);

      if (disableError) {
        console.error('Error disabling tokens:', disableError);
        return new Response(
          JSON.stringify({ error: 'Failed to disable notifications' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check if token already exists for this user
    const { data: existingTokens, error: fetchError } = await supabaseClient
      .from('push_notification_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('token', token);

    if (fetchError) {
      console.error('Error fetching existing tokens:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If token doesn't exist, insert it
    if (existingTokens.length === 0) {
      const { error: insertError } = await supabaseClient
        .from('push_notification_tokens')
        .insert({
          user_id: user.id,
          token: token,
          platform: platform,
          enabled: true
        });

      if (insertError) {
        console.error('Error registering token:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to register token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // If token exists but may be disabled, enable it
      const { error: updateError } = await supabaseClient
        .from('push_notification_tokens')
        .update({ enabled: true })
        .eq('user_id', user.id)
        .eq('token', token);

      if (updateError) {
        console.error('Error updating token status:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update token status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Registration successful' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
