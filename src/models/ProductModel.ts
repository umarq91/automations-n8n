import { supabase } from '../lib/supabase/client';
import type { Product } from '../lib/supabase/types';

export class ProductModel {
  static async getAll(organizationId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
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
}
