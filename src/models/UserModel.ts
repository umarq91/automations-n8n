import { supabase } from '../lib/supabase/client';
import type { User } from '../lib/supabase/types';

export class UserModel {
  static async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as User | null;
  }

  static async upsert(profile: Omit<User, 'created_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .upsert(profile as any, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as User;
  }

  static async update(
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

    const metaUpdates: Record<string, unknown> = {};
    if (updates.full_name !== undefined) metaUpdates.full_name = updates.full_name;
    if (updates.avatar_url !== undefined) metaUpdates.avatar_url = updates.avatar_url;
    if (Object.keys(metaUpdates).length > 0) {
      await supabase.auth.updateUser({ data: metaUpdates });
    }

    return data as User;
  }
}
