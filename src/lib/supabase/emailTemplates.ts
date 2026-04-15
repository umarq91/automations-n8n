import { supabase } from './client';
import type { DbEmailTemplate } from './types';

/**
 * Load all templates visible to an org:
 *   - global defaults  (organization_id IS NULL)
 *   - org-custom ones  (organization_id = orgId)
 * Sorted: defaults first, then alphabetically by name.
 */
export async function getEmailTemplates(orgId: string): Promise<DbEmailTemplate[]> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .or(`organization_id.is.null,organization_id.eq.${orgId}`)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbEmailTemplate[];
}

export type CreateEmailTemplateInput = Pick<
  DbEmailTemplate,
  'name' | 'category' | 'subject' | 'description' | 'html_body' | 'variables' | 'tags'
>;

export async function createEmailTemplate(
  orgId: string,
  userId: string,
  input: CreateEmailTemplateInput
): Promise<DbEmailTemplate> {
  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      organization_id: orgId,
      created_by: userId,
      is_default: false,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbEmailTemplate;
}

export async function updateEmailTemplate(
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

export async function deleteEmailTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Duplicate any template (global default or custom) as a new org-custom copy.
 */
export async function duplicateEmailTemplate(
  orgId: string,
  userId: string,
  source: DbEmailTemplate
): Promise<DbEmailTemplate> {
  return createEmailTemplate(orgId, userId, {
    name: `${source.name} (Copy)`,
    category: source.category,
    subject: source.subject,
    description: source.description,
    html_body: source.html_body,
    variables: source.variables,
    tags: source.tags,
  });
}
