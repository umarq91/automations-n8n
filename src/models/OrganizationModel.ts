import { supabase } from '../lib/supabase/client';
import type { Organization, OrganizationWithRole } from '../lib/supabase/types';

export class OrganizationModel {
  static async getForUser(userId: string): Promise<OrganizationWithRole[]> {
    const { data: memberships, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (memberError) throw memberError;
    if (!memberships?.length) return [];

    const orgIds = memberships.map((m: any) => m.organization_id);
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .in('id', orgIds);
    if (orgError) throw orgError;

    return ((orgs ?? []) as Organization[]).map((org) => {
      const membership = (memberships as any[]).find((m) => m.organization_id === org.id);
      return { ...org, role: membership?.role ?? 'member' } as OrganizationWithRole;
    });
  }

  static async getById(orgId: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();
    if (error) throw error;
    return data as Organization | null;
  }

  static async create(name: string, slug: string, ownerId: string): Promise<Organization> {
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

  static async update(
    orgId: string,
    updates: Partial<Pick<Organization, 'name' | 'slug' | 'plan' | 'status' | 'is_under_maintenance' | 'metadata'>>
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
}
