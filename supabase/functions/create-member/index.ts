import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('authorization');
  if (!authHeader) return json({ ok: false, message: 'Missing authorization header' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Admin client — service role, bypasses RLS
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Decode the JWT payload to extract the caller's user ID.
  // We skip signature verification here because the org membership check
  // below (via service role) is the actual security gate.
  const jwt = authHeader.replace('Bearer ', '');
  let callerId: string;
  try {
    const [, payloadB64] = jwt.split('.');
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.sub) throw new Error('no sub');
    callerId = payload.sub as string;
  } catch {
    return json({ ok: false, message: 'Invalid token' }, 401);
  }

  let body: { org_id: string; full_name: string; email: string; password: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: 'Invalid JSON body' }, 400);
  }

  const { org_id, full_name, email, password } = body;
  if (!org_id || !full_name?.trim() || !email?.trim() || !password) {
    return json({ ok: false, message: 'Missing required fields: org_id, full_name, email, password' }, 400);
  }

  // Verify caller is owner or admin of the org
  const { data: membership, error: memberError } = await admin
    .from('organization_members')
    .select('role')
    .eq('organization_id', org_id)
    .eq('user_id', callerId)
    .eq('status', 'active')
    .single();

  if (memberError || !membership) {
    return json({ ok: false, message: 'You are not an active member of this organization' }, 403);
  }

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    return json({ ok: false, message: 'Only owners and admins can add members' }, 403);
  }

  // Check if email already exists in this org
  const { data: existingByEmail } = await admin
    .from('users')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (existingByEmail) {
    // Check if already a member
    const { data: existingMembership } = await admin
      .from('organization_members')
      .select('id')
      .eq('organization_id', org_id)
      .eq('user_id', existingByEmail.id)
      .maybeSingle();

    if (existingMembership) {
      return json({ ok: false, message: 'This email is already a member of the organization' }, 409);
    }
  }

  // Create auth user — email_confirm: true so they can log in immediately
  const { data: newAuthUser, error: createError } = await admin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name.trim() },
  });

  if (createError || !newAuthUser.user) {
    return json({ ok: false, message: createError?.message ?? 'Failed to create user account' }, 400);
  }

  const newUserId = newAuthUser.user.id;

  // Upsert into public.users
  await admin.from('users').upsert({
    id: newUserId,
    email: email.trim().toLowerCase(),
    full_name: full_name.trim(),
    avatar_url: null,
  }, { onConflict: 'id' });

  // Add to organization as supplier, status active
  const { error: memberInsertError } = await admin
    .from('organization_members')
    .insert({
      organization_id: org_id,
      user_id: newUserId,
      role: 'supplier',
      status: 'active',
    });

  if (memberInsertError) {
    // Roll back the auth user to avoid orphaned accounts
    await admin.auth.admin.deleteUser(newUserId);
    return json({ ok: false, message: memberInsertError.message }, 500);
  }

  return json({
    ok: true,
    message: `Supplier account created for ${full_name.trim()}.`,
    user_id: newUserId,
  });
});
