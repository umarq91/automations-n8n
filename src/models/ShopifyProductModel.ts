import { supabase } from '../lib/supabase/client';
import type { ShopifyProduct } from '../lib/supabase/types';

export interface ShopifyConnection {
  connected: boolean;
  lastSyncAt: string | null;
  lastSyncCount: number | null;
}

export type SyncResult =
  | { ok: true; count: number; synced_at: string }
  | { ok: false; message: string };

export class ShopifyProductModel {
  static async getAll(organizationId: string): Promise<ShopifyProduct[]> {
    const { data, error } = await supabase
      .from('shopify_products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('shopify_updated_at', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data ?? []) as ShopifyProduct[];
  }

  static async getConnection(organizationId: string): Promise<ShopifyConnection> {
    const { data, error } = await supabase
      .from('integrations')
      .select('is_active, metadata')
      .eq('organization_id', organizationId)
      .eq('provider', 'shopify')
      .maybeSingle();
    if (error) throw error;

    const meta = (data?.metadata ?? {}) as Record<string, unknown>;
    return {
      connected: Boolean(data?.is_active),
      lastSyncAt: (meta.last_products_sync_at as string | undefined) ?? null,
      lastSyncCount: (meta.last_products_sync_count as number | undefined) ?? null,
    };
  }

  static async sync(organizationId: string): Promise<SyncResult> {
    const { data, error } = await supabase.functions.invoke('shopify-sync-products', {
      body: { org_id: organizationId },
    });
    if (error) return { ok: false, message: error.message ?? 'Failed to sync Shopify products.' };
    return data as SyncResult;
  }
}
