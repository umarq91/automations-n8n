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

  static async getPage(
    organizationId: string,
    page: number,
    pageSize: number,
    type?: string
  ): Promise<{ data: WorkflowLog[]; total: number }> {
    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;
    let query = supabase
      .from('workflow_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (type && type !== 'all') query = query.eq('type', type);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data ?? [], total: count ?? 0 };
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
