import { supabase } from '../lib/supabase/client';
import type { OrganizationCredits, CreditUsageLog } from '../lib/supabase/types';

const PLAN_DEFAULTS: Record<string, { listing: number; support: number; optimization: number }> = {
  free:       { listing: 100,  support: 50,   optimization: 30  },
  pro:        { listing: 500,  support: 200,  optimization: 150 },
  enterprise: { listing: 2000, support: 1000, optimization: 500 },
};

export class CreditModel {
  static async get(orgId: string): Promise<OrganizationCredits | null> {
    const { data, error } = await supabase
      .from('organization_credits')
      .select('*')
      .eq('organization_id', orgId)
      .single();
    if (error) return null;
    return data as OrganizationCredits;
  }

  static async getLogs(orgId: string, since?: string): Promise<CreditUsageLog[]> {
    let query = supabase
      .from('credit_usage_logs')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (since) query = query.gte('created_at', since);
    const { data, error } = await query;
    if (error) return [];
    return data as CreditUsageLog[];
  }

  static async init(orgId: string, plan: string): Promise<void> {
    const defaults = PLAN_DEFAULTS[plan] ?? PLAN_DEFAULTS.free;
    await supabase.from('organization_credits').upsert({
      organization_id:            orgId,
      listing_credits_total:      defaults.listing,
      support_credits_total:      defaults.support,
      optimization_credits_total: defaults.optimization,
      listing_credits_used:       0,
      support_credits_used:       0,
      optimization_credits_used:  0,
      period_start:               new Date().toISOString(),
      period_end:                 new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'organization_id' });
  }
}
