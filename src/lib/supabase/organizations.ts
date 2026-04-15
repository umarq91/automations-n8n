import { supabase } from './client';
import type { Organization, OrganizationWithRole } from './types';

/** All orgs the current user belongs to, with their role */
export async function getUserOrganizations(userId: string): Promise<OrganizationWithRole[]> {
  // Step 1: get all active memberships for this user
  const { data: memberships, error: memberError } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (memberError) throw memberError;
  if (!memberships?.length) return [];

  const orgIds = memberships.map((m: any) => m.organization_id);

  // Step 2: fetch the actual org rows
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .in('id', orgIds);

  if (orgError) throw orgError;

  // Step 3: merge role onto each org
  return ((orgs ?? []) as Organization[]).map((org) => {
    const membership = (memberships as any[]).find((m) => m.organization_id === org.id);
    return { ...org, role: membership?.role ?? 'member' } as OrganizationWithRole;
  });
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (error) throw error;
  return data as Organization | null;
}

export async function createOrganization(
  name: string,
  slug: string,
  ownerId: string
): Promise<Organization> {
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, slug, owner_id: ownerId } as any)
    .select()
    .single();

  if (orgError) throw orgError;
  const typedOrg = org as Organization;

  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({ organization_id: typedOrg.id, user_id: ownerId, role: 'owner', status: 'active' } as any);

  if (memberError) throw memberError;

  return typedOrg;
}

export async function updateOrganization(
  orgId: string,
  updates: Partial<Pick<Organization, 'name' | 'slug' | 'plan' | 'status' | 'metadata'>>
): Promise<Organization> {
  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}
