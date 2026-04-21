import { useEffect, useRef, useState } from 'react';
import { Trash2, X, Loader2, AlertCircle, Plus, Save, Send, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { EmailTemplateModel } from '../../../models/EmailTemplateModel';
import type { DbEmailTemplate } from '../../../lib/supabase/types';
import { CATEGORY_GROUPS, varLabel } from '../emailHelpers';
import VisualEditor from './VisualEditor';

interface TemplateDetailProps {
  template: DbEmailTemplate;
  onDelete: (id: string) => void;
  onUpdate: (updated: DbEmailTemplate, replacedId?: string) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type TestStatus = 'idle' | 'sending' | 'sent' | 'error';

export default function TemplateDetail({ template, onDelete, onUpdate }: TemplateDetailProps) {
  const { user, activeOrg } = useAuth();

  const [draft,      setDraft]      = useState<DbEmailTemplate>(template);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testError,  setTestError]  = useState<string | null>(null);
  const [varInput,   setVarInput]   = useState('');
  const [tagInput,   setTagInput]   = useState('');
  const isDefaultRef = useRef(template.is_default && template.organization_id === null);

  useEffect(() => {
    setDraft(template);
    setHasChanges(false);
    setSaveStatus('idle');
    isDefaultRef.current = template.is_default && template.organization_id === null;
  }, [template.id]);

  const patch = (changes: Partial<DbEmailTemplate>) => {
    setDraft((prev) => ({ ...prev, ...changes }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      if (isDefaultRef.current && activeOrg && user) {
        const saved = await EmailTemplateModel.create(activeOrg.id, user.id, {
          name: draft.name, category: draft.category, subject: draft.subject,
          description: draft.description, html_body: draft.html_body,
          variables: draft.variables, tags: draft.tags,
        });
        isDefaultRef.current = false;
        onUpdate(saved, template.id);
      } else {
        const saved = await EmailTemplateModel.update(draft.id, {
          name: draft.name, category: draft.category, subject: draft.subject,
          description: draft.description, html_body: draft.html_body,
          variables: draft.variables, tags: draft.tags,
        });
        onUpdate(saved);
      }
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email || testStatus === 'sending') return;
    setTestStatus('sending');
    setTestError(null);
    const result = await EmailTemplateModel.sendTest({
      to: user.email,
      subject: draft.subject,
      html_body: draft.html_body,
    });
    if (result.ok) {
      setTestStatus('sent');
      setTimeout(() => setTestStatus('idle'), 5000);
    } else {
      setTestStatus('error');
      setTestError(result.message);
      setTimeout(() => { setTestStatus('idle'); setTestError(null); }, 6000);
    }
  };

  const addVar = () => {
    const v = varInput.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!v || draft.variables.includes(v)) return;
    patch({ variables: [...draft.variables, v] });
    setVarInput('');
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t || draft.tags.includes(t)) return;
    patch({ tags: [...draft.tags, t] });
    setTagInput('');
  };

  const subjectLen  = draft.subject.length;
  const subjectOver = subjectLen > 60;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center gap-3 flex-wrap">
        <input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="input text-sm font-semibold flex-1 min-w-0"
          placeholder="Template name"
        />
        {hasChanges && saveStatus === 'idle' && <span className="text-xs text-amber-400 shrink-0">Unsaved changes</span>}
        {saveStatus === 'saved' && <span className="text-xs text-emerald-400 shrink-0">✓ Saved</span>}
        {saveStatus === 'error' && <span className="text-xs text-red-400 shrink-0">⚠ Save failed — try again</span>}

        <button
          onClick={handleTestEmail}
          disabled={testStatus === 'sending' || testStatus === 'sent'}
          className="btn-secondary flex items-center gap-2 text-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          title={`Send a test email to ${user?.email ?? 'yourself'}`}
        >
          {testStatus === 'sending'
            ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
            : testStatus === 'sent'
            ? <><CheckCircle2 size={14} className="text-emerald-400" /> Sent!</>
            : <><Send size={14} /> Test Email</>}
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === 'saving'}
          className={`flex items-center gap-2 text-sm shrink-0 transition-all ${hasChanges ? 'btn-primary' : 'btn-primary opacity-40 cursor-not-allowed'}`}
        >
          {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saveStatus === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>

        {!template.is_default && (
          <button
            onClick={() => onDelete(template.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-ds-muted hover:text-red-400 transition-colors shrink-0"
            title="Delete this template"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {testStatus === 'sent' && (
        <div className="flex items-center gap-2.5 px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 size={15} className="shrink-0" />
          Test email sent to <span className="font-medium">{user?.email}</span> — variables replaced with sample data.
        </div>
      )}
      {testStatus === 'error' && testError && (
        <div className="flex items-center gap-2.5 px-5 py-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          {testError}
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="label">Category</label>
            <select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value })}
              className="input w-auto bg-ds-surface2 text-sm"
            >
              {CATEGORY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="pb-0.5">
            {template.is_default ? (
              <span className="badge bg-ds-surface2 text-ds-muted">Default — save to customize for your org</span>
            ) : (
              <span className="badge bg-ds-accent/10 text-ds-accent inline-flex items-center gap-1">
                <Sparkles size={11} /> Customized for your org
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <p className="text-xs text-ds-muted mb-1.5">A short note shown in the template list to help you find it quickly.</p>
          <input
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            className="input text-sm"
            placeholder="e.g. Sent when a customer reports a damaged item"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Email Subject Line</label>
            <span className={`text-xs ${subjectOver ? 'text-amber-400' : 'text-ds-muted'}`}>
              {subjectLen}/60{subjectOver && ' — consider shortening'}
            </span>
          </div>
          <input
            value={draft.subject}
            onChange={(e) => patch({ subject: e.target.value })}
            className="input text-sm"
            placeholder="e.g. We're sorry about your order — here's what we'll do"
          />
        </div>

        <div>
          <label className="label">Email Body</label>
          <VisualEditor html={draft.html_body} variables={draft.variables} onChange={(html) => patch({ html_body: html })} />
        </div>

        <div className="rounded-xl border border-ds-borderSoft bg-ds-surface2/40 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-ds-text">Personalization Fields</p>
            <p className="text-xs text-ds-muted mt-0.5">
              Smart placeholders replaced with real customer data when the email is sent.
              Use <span className="text-ds-accent font-medium">Insert Field</span> in the toolbar above to place them in your email.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {draft.variables.map((v) => (
              <div key={v} className="inline-flex items-center gap-2 px-3 py-1.5 bg-ds-surface border border-ds-border rounded-lg text-xs">
                <span className="font-medium text-ds-text">{varLabel(v)}</span>
                <span className="font-mono text-[10px] text-ds-muted">{`{{${v}}}`}</span>
                <button
                  onClick={() => patch({ variables: draft.variables.filter((x) => x !== v) })}
                  className="text-ds-muted hover:text-red-400 transition-colors"
                  title={`Remove ${varLabel(v)}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <div className="flex gap-1.5 items-center">
              <input
                value={varInput}
                onChange={(e) => setVarInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVar())}
                placeholder="new_field"
                className="input h-8 text-xs font-mono px-2.5 w-28"
              />
              <button onClick={addVar} className="btn-ghost h-8 px-2.5 text-xs flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="label">Labels</label>
          <p className="text-xs text-ds-muted mb-2">Used for search and filtering only — not included in the email.</p>
          <div className="flex flex-wrap gap-2">
            {draft.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => patch({ tags: draft.tags.filter((x) => x !== tag) })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-ds-hover text-ds-text2 rounded-full text-xs hover:bg-ds-border transition-colors"
              >
                #{tag} <X size={10} />
              </button>
            ))}
            <div className="flex gap-1.5 items-center">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="label"
                className="input h-7 text-xs px-2 w-24"
              />
              <button onClick={addTag} className="btn-ghost h-7 px-2 text-xs flex items-center gap-1">
                <Tag size={11} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
