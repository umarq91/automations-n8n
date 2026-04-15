import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const shop = url.searchParams.get('shop');

  function redirectError(msg: string) {
    return Response.redirect(`${SITE_URL}?shopify_error=${encodeURIComponent(msg)}`, 302);
  }

  if (!code || !state || !shop) {
    return redirectError('Missing required OAuth parameters from Shopify.');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Look up pending integration by oauth_state
  const { data: rows, error: fetchError } = await supabase
    .from('integrations')
    .select('*')
    .eq('provider', 'shopify')
    .eq('metadata->>oauth_state', state)
    .limit(1);

  if (fetchError || !rows?.length) {
    return redirectError('Session expired. Please try connecting again.');
  }

  const integration = rows[0];
  const { shop_domain, client_id, client_secret } = integration.credentials as {
    shop_domain: string;
    client_id: string;
    client_secret: string;
  };

  // Validate the shop matches
  if (shop !== shop_domain) {
    return redirectError('Store mismatch. Please try connecting again.');
  }

  // Exchange code for access_token
  let tokenRes: Response;
  try {
    tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
  } catch {
    return redirectError('Failed to reach Shopify during token exchange.');
  }

  if (!tokenRes.ok) {
    return redirectError('Shopify rejected the connection. Check your Client ID and Secret and try again.');
  }

  const { access_token, scope } = await tokenRes.json();

  // Update integration: activate it, store access_token, clear oauth_state
  const { error: updateError } = await supabase
    .from('integrations')
    .update({
      credentials: { shop_domain, client_id, client_secret, access_token, scope },
      metadata: {},
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', integration.id);

  if (updateError) {
    return redirectError('Connected to Shopify but could not save. Please try again.');
  }

  return Response.redirect(
    `${SITE_URL}?shopify_connected=1&org_id=${encodeURIComponent(integration.organization_id)}`,
    302,
  );
});
