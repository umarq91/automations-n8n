import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CALLBACK_URL = 'https://ypecrutyiresoalyvhio.supabase.co/functions/v1/shopify-oauth-callback';
const SCOPES = 'read_products,read_orders,write_orders,read_customers';

function respond(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { org_id, user_id, shop_domain, client_id, client_secret } = await req.json().catch(() => ({}));

  if (!org_id || !user_id || !shop_domain || !client_id || !client_secret) {
    return respond({ ok: false, message: 'All fields are required.' });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const state = crypto.randomUUID();
  const now = new Date().toISOString();

  // Check if an integration row already exists for this org + shopify
  const { data: existing } = await supabase
    .from('integrations')
    .select('id')
    .eq('organization_id', org_id)
    .eq('provider', 'shopify')
    .maybeSingle();

  let dbError;
  if (existing) {
    const { error } = await supabase
      .from('integrations')
      .update({
        credentials: { shop_domain, client_id, client_secret },
        metadata: { oauth_state: state },
        is_active: false,
        updated_at: now,
      })
      .eq('id', existing.id);
    dbError = error;
  } else {
    const { error } = await supabase
      .from('integrations')
      .insert({
        organization_id: org_id,
        provider: 'shopify',
        category: 'ecommerce',
        auth_type: 'oauth2',
        credentials: { shop_domain, client_id, client_secret },
        metadata: { oauth_state: state },
        is_active: false,
        created_by: user_id,
        created_at: now,
        updated_at: now,
      });
    dbError = error;
  }

  if (dbError) {
    console.error('DB error:', dbError);
    return respond({ ok: false, message: 'Could not save your credentials. Please try again.' });
  }

  const authUrl =
    `https://${shop_domain}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(client_id)}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}` +
    `&state=${encodeURIComponent(state)}`;

  return respond({ ok: true, url: authUrl });
});
