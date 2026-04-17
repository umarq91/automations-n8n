import { supabase } from './client';
import type { MemberRole, MemberStatus, OrganizationMember, OrganizationMemberWithUser } from './types';

export async function createMemberAccount(
  orgId: string,
  fullName: string,
  email: string,
  password: string,
): Promise<{ user_id: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await supabase.functions.invoke('create-member', {
    body: { org_id: orgId, full_name: fullName, email, password },
  });

  if (res.error) throw new Error(res.error.message);
  const payload = res.data as { ok: boolean; message: string; user_id?: string };
  if (!payload.ok) throw new Error(payload.message);
  return { user_id: payload.user_id! };
}

export async function getOrganizationMembers(orgId: string): Promise<OrganizationMemberWithUser[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      user:users (*)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as OrganizationMemberWithUser[];
}

/** Invite an existing auth user to an org by user_id (admin-created accounts flow) */
export async function addMember(
  orgId: string,
  userId: string,
  role: MemberRole = 'member'
): Promise<OrganizationMember> {
  const { data, error } = await supabase
    .from('organization_members')
    .insert({ organization_id: orgId, user_id: userId, role, status: 'invited' } as any)
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationMember;
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: MemberRole
): Promise<OrganizationMember> {
  const { data, error } = await supabase
    .from('organization_members')
    .update({ role } as any)
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationMember;
}

export async function updateMemberStatus(
  orgId: string,
  userId: string,
  status: MemberStatus
): Promise<OrganizationMember> {
  const { data, error } = await supabase
    .from('organization_members')
    .update({ status } as any)
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationMember;
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', orgId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getMemberRole(
  orgId: string,
  userId: string
): Promise<MemberRole | null> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) return null;
  return (data as any)?.role ?? null;
}
