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

  static async getRecent(organizationId: string, limit = 30): Promise<WorkflowLog[]> {
    const { data, error } = await supabase
      .from('workflow_logs')
      .select('id, organization_id, workflow_id, workflow_name, execution_id, execution_url, type, error_description, last_node_executed, message, product_id, product_title, product_link, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }
}
