import { supabase } from './client';
import type { Product } from './types';

export async function getProducts(organizationId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProduct(
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

export async function updateProduct(
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

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadProductPhoto(
  file: File,
  orgId: string,
  productId: string
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${orgId}/${productId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-photos')
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('product-photos').getPublicUrl(path);
  return data.publicUrl;
}
