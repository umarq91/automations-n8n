import { supabase } from '../lib/supabase/client';
import type {
  Integration,
  IntegrationProvider,
  IntegrationCredentials,
  ReamazeCredentials,
} from '../lib/supabase/types';

export type OAuthInitResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export type TestResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export class IntegrationModel {
  static async getAll(orgId: string): Promise<Integration[]> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Integration[];
  }

  static async upsert(payload: {
    id?: string;
    organization_id: string;
    provider: IntegrationProvider;
    category: string;
    auth_type: string;
    credentials: IntegrationCredentials;
    created_by: string;
  }): Promise<Integration> {
    const now = new Date().toISOString();
    const row = {
      ...payload,
      is_active: true,
      metadata: {},
      updated_at: now,
      ...(payload.id ? {} : { created_at: now }),
    };
    const { data, error } = await supabase
      .from('integrations')
      .upsert(row as any, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as Integration;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('integrations').delete().eq('id', id);
    if (error) throw error;
  }

  static async initiateShopifyOAuth(payload: {
    org_id: string;
    user_id: string;
    shop_domain: string;
    client_id: string;
    client_secret: string;
  }): Promise<OAuthInitResult> {
    const { data, error } = await supabase.functions.invoke('shopify-oauth-init', {
      body: payload,
    });
    if (error) return { ok: false, message: error.message ?? 'Failed to initiate Shopify connection.' };
    return data as OAuthInitResult;
  }

  static async testCredentials(
    provider: IntegrationProvider,
    credentials: ReamazeCredentials
  ): Promise<TestResult> {
    const { data, error } = await supabase.functions.invoke('test-integration', {
      body: { provider, credentials },
    });
    if (error) return { ok: false, message: error.message ?? 'Failed to reach the validation service.' };
    return data as TestResult;
  }
}
