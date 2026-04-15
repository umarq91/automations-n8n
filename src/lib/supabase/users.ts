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
  const { data, error } = await supabase
    .from('users')
    .update(updates as any)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}
