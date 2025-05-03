
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
    const { token, platform, enabled = true, action } = body;
    
    // Check status action - just return if the user has any enabled tokens
    if (action === 'check-status') {
      console.log('Checking notification status for user:', user.id);
      
      const { data: tokens, error: fetchError } = await supabaseClient
        .from('notifications')  // Using the existing notifications table
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'push_token')  // Using a type field to identify push tokens
        .eq('read', false)  // Using read=false to indicate enabled tokens
        .limit(1);

      if (fetchError) {
        console.error('Error checking token status:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Failed to check token status', details: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          enabled: tokens && tokens.length > 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
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
        .from('notifications')
        .update({ read: true })  // Mark as read to disable
        .eq('user_id', user.id)
        .eq('type', 'push_token');

      if (disableError) {
        console.error('Error disabling tokens:', disableError);
        return new Response(
          JSON.stringify({ error: 'Failed to disable notifications', details: disableError.message }),
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
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'push_token')
      .eq('message', token);  // Store token in the message field

    if (fetchError) {
      console.error('Error fetching existing tokens:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing tokens', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If token doesn't exist, insert it
    if (existingTokens.length === 0) {
      const { error: insertError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'push_token',
          message: token,  // Store token in message field
          read: false,     // Use read=false to indicate enabled
          link: platform   // Store platform in link field
        });

      if (insertError) {
        console.error('Error registering token:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to register token', details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // If token exists but may be disabled, enable it
      const { error: updateError } = await supabaseClient
        .from('notifications')
        .update({ read: false })  // Mark as unread to enable
        .eq('user_id', user.id)
        .eq('type', 'push_token')
        .eq('message', token);

      if (updateError) {
        console.error('Error updating token status:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update token status', details: updateError.message }),
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
