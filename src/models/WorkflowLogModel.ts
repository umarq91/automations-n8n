import { supabase } from '../lib/supabase/client';
import type { WorkflowLog } from '../lib/supabase/types';

export class WorkflowLogModel {
  static async getAll(organizationId: string): Promise<WorkflowLog[]> {
    const { data, error } = await supabase
      .from('workflow_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
