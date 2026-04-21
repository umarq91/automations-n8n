import { supabase } from '../lib/supabase/client';
import type { DbEmailTemplate } from '../lib/supabase/types';

export type CreateEmailTemplateInput = Pick<
  DbEmailTemplate,
  'name' | 'category' | 'subject' | 'description' | 'html_body' | 'variables' | 'tags'
>;

export class EmailTemplateModel {
  static async getAll(orgId: string): Promise<DbEmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .or(`organization_id.is.null,organization_id.eq.${orgId}`)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []) as DbEmailTemplate[];
  }

  static async create(
    orgId: string,
    userId: string,
    input: CreateEmailTemplateInput
  ): Promise<DbEmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({ organization_id: orgId, created_by: userId, is_default: false, ...input })
      .select()
      .single();
    if (error) throw error;
    return data as DbEmailTemplate;
  }

  static async update(
    id: string,
    updates: Partial<CreateEmailTemplateInput>
  ): Promise<DbEmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as DbEmailTemplate;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('email_templates').delete().eq('id', id);
    if (error) throw error;
  }

  static async sendTest(payload: {
    to: string;
    subject: string;
    html_body: string;
  }): Promise<{ ok: boolean; message: string }> {
    const { data, error } = await supabase.functions.invoke('send-test-email', { body: payload });
    if (error) return { ok: false, message: error.message ?? 'Failed to send test email.' };
    return data as { ok: boolean; message: string };
  }

  static async duplicate(
    orgId: string,
    userId: string,
    source: DbEmailTemplate
  ): Promise<DbEmailTemplate> {
    return EmailTemplateModel.create(orgId, userId, {
      name: `${source.name} (Copy)`,
      category: source.category,
      subject: source.subject,
      description: source.description,
      html_body: source.html_body,
      variables: source.variables,
      tags: source.tags,
    });
  }
}
