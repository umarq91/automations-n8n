import { supabase } from '../lib/supabase/client';
import type { Product } from '../lib/supabase/types';

export interface ShopifyConnection {
  connected: boolean;
  lastSyncAt: string | null;
  lastSyncCount: number | null;
}

export type SyncResult =
  | { ok: true; count: number; synced_at: string }
  | { ok: false; message: string };

export class ProductModel {
  static async getAll(organizationId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('source', 'manual')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  static async getPage(
    organizationId: string,
    page: number,
    pageSize: number
  ): Promise<{ data: Product[]; total: number }> {
    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('source', 'manual')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data: data ?? [], total: count ?? 0 };
  }

  static async getAllShopify(organizationId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('source', 'shopify')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  static async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(
    product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(
    id: string,
    updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  static async setOptimizeStatus(
    id: string,
    toOptimize: boolean,
    optimizedAt: string | null = null
  ): Promise<void> {
    const patch: Record<string, unknown> = { to_optimize: toOptimize, optimized_at: optimizedAt };
    if (toOptimize) patch.status = 'NOT_OPTIMIZED';
    else if (optimizedAt) patch.status = 'OPTIMIZED';
    const { error } = await supabase.from('products').update(patch).eq('id', id);
    if (error) throw error;
  }

  static async uploadPhoto(file: File, orgId: string, productId: string): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${orgId}/${productId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('product-photos')
      .upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('product-photos').getPublicUrl(path);
    return data.publicUrl;
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

  static async batchCreate(
    products: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<number> {
    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select('id');
    if (error) throw error;
    return data?.length ?? 0;
  }

  static async duplicate(product: Product, userId: string): Promise<Product> {
    const { id, created_at, updated_at, shopify_id, shopify_status, metadata, ...rest } = product;
    void id; void created_at; void updated_at; void shopify_id; void shopify_status; void metadata;
    const payload = {
      ...rest,
      title: `${product.title} (Copy)`,
      status: 'NOT_IMPORTED' as Product['status'],
      source: 'manual' as const,
      shopify_product_url: null,
      shopify_admin_url: null,
      photo_url: null,
      to_optimize: false,
      created_by: userId,
    };
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async bulkDelete(ids: string[]): Promise<void> {
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) throw error;
  }

  static async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    const { error } = await supabase.from('products').update({ status }).in('id', ids);
    if (error) throw error;
  }

  static async sync(organizationId: string): Promise<SyncResult> {
    const { data, error } = await supabase.functions.invoke('shopify-sync-products', {
      body: { org_id: organizationId },
    });
    if (error) return { ok: false, message: error.message ?? 'Failed to sync Shopify products.' };
    return data as SyncResult;
  }
}
