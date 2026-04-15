import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ReamazeCredentials {
  subdomain: string;
  email: string;
  api_key: string;
}

async function testReamaze(creds: ReamazeCredentials): Promise<{ ok: boolean; message: string }> {
  if (!creds.subdomain || !creds.email || !creds.api_key) {
    return { ok: false, message: 'Missing subdomain, email, or API token.' };
  }

  const token = btoa(`${creds.email}:${creds.api_key}`);
  const url = `https://${creds.subdomain}.reamaze.com/api/v1/conversations`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${token}`,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    return { ok: false, message: `Could not reach ${creds.subdomain}.reamaze.com. Check the subdomain.` };
  }

  if (res.ok) {
    return { ok: true, message: `Connected to ${creds.subdomain}.reamaze.com successfully.` };
  }

  if (res.status === 401) {
    return { ok: false, message: 'Wrong login or API token. Make sure your login is in the format "brand@subdomain.reamaze.com" and your API token is correct.' };
  }
  if (res.status === 403) {
    return { ok: false, message: 'Access denied. Your account may not have permission to access this resource.' };
  }
  if (res.status === 404) {
    return { ok: false, message: `Couldn't find a Reamaze account at "${creds.subdomain}.reamaze.com". Double-check your subdomain.` };
  }
  if (res.status === 429) {
    return { ok: false, message: 'Too many requests. Please wait a moment and try again.' };
  }
  return { ok: false, message: 'Something went wrong connecting to Reamaze. Please check your credentials and try again.' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { provider: string; credentials: ReamazeCredentials };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let result: { ok: boolean; message: string };

  if (body.provider === 'reamaze') {
    result = await testReamaze(body.credentials as ReamazeCredentials);
  } else {
    result = { ok: false, message: `Unknown provider: ${body.provider}` };
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
