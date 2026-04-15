import { supabase } from './client';
import type { User } from './types';

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User | null;
}

export async function upsertUserProfile(profile: Omit<User, 'created_at'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .upsert(profile as any, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'full_name' | 'avatar_url'>>
): Promise<User> {
  // Update public.users
  const { data, error } = await supabase
    .from('users')
    .update(updates as any)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Sync the same fields into auth.users user_metadata so they
  // survive the next login's upsertUserProfile sync.
  const metaUpdates: Record<string, unknown> = {};
  if (updates.full_name !== undefined) metaUpdates.full_name = updates.full_name;
  if (updates.avatar_url !== undefined) metaUpdates.avatar_url = updates.avatar_url;
  if (Object.keys(metaUpdates).length > 0) {
    await supabase.auth.updateUser({ data: metaUpdates });
  }

  return data as User;
}
