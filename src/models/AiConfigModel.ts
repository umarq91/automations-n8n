import { supabase } from '../lib/supabase/client';
import type { AiConfig } from '../lib/supabase/types';

export class AiConfigModel {
  static async get(orgId: string): Promise<AiConfig | null> {
    const { data, error } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  static async upsert(
    config: Partial<Omit<AiConfig, 'id' | 'created_at' | 'updated_at'>> & { organization_id: string }
  ): Promise<AiConfig> {
    const { data, error } = await supabase
      .from('ai_configs')
      .upsert(config, { onConflict: 'organization_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
