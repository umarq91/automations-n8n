import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Trash2, Search, Mail, Tag, X, Loader2, AlertCircle,
  Plus, Sparkles, ChevronDown, Save, Send, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '../lib/supabase/emailTemplates';
import { sendTestEmail } from '../lib/supabase/emailSend';
import type { DbEmailTemplate } from '../lib/supabase/types';

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_GROUPS = [
  {
    label: 'Customer Issues',
    items: [
      'Quality Issue', 'Wrong Item', 'Color Mismatch', 'Sizing Complaint',
      'Missing Package', 'Partial Order', 'Shipping Delay', 'Customs Hold',
      'Refund Delayed', 'Active Dispute', 'Escalation Threat',
      'Order Not Found', 'Sizing Inquiry', 'Misdirected Email',
      'Repeat Contact', 'Privacy Breach', 'Positive Feedback',
    ],
  },
  {
    label: 'Order Status',
    items: ['Order Status'],
  },
  {
    label: 'Business',
    items: ['Transactional', 'Returns & Refunds', 'Financial', 'Support', 'Marketing', 'Security', 'Operations', 'B2B'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Quality Issue':      'bg-amber-500/10  text-amber-400',
  'Wrong Item':         'bg-red-500/10    text-red-400',
  'Color Mismatch':     'bg-orange-500/10 text-orange-400',
  'Sizing Complaint':   'bg-amber-500/10  text-amber-400',
  'Missing Package':    'bg-red-500/10    text-red-400',
  'Partial Order':      'bg-amber-500/10  text-amber-400',
  'Refund Delayed':     'bg-amber-500/10  text-amber-400',
  'Active Dispute':     'bg-red-500/10    text-red-400',
  'Escalation Threat':  'bg-red-500/10    text-red-400',
  'Order Not Found':    'bg-blue-500/10   text-blue-400',
  'Sizing Inquiry':     'bg-blue-500/10   text-blue-400',
  'Shipping Delay':     'bg-blue-500/10   text-blue-400',
  'Customs Hold':       'bg-amber-500/10  text-amber-400',
  'Misdirected Email':  'bg-ds-hover      text-ds-text2',
  'Repeat Contact':     'bg-red-500/10    text-red-400',
  'Privacy Breach':     'bg-red-500/10    text-red-400',
  'Positive Feedback':  'bg-emerald-500/10 text-emerald-400',
  'Order Status':                      'bg-blue-500/10   text-blue-400',
  Transactional:        'bg-indigo-500/10 text-indigo-400',
  'Returns & Refunds':  'bg-amber-500/10  text-amber-400',
  Financial:            'bg-emerald-500/10 text-emerald-400',
  Support:              'bg-blue-500/10   text-blue-400',
  Marketing:            'bg-pink-500/10   text-pink-400',
  Security:             'bg-red-500/10    text-red-400',
  Operations:           'bg-ds-hover      text-ds-text2',
  B2B:                  'bg-violet-500/10 text-violet-400',
};

// Convert snake_case variable names to friendly human-readable labels
function varLabel(v: string): string {
  const map: Record<string, string> = {
    customer_name: 'Customer Name',
    first_name: 'First Name',
    last_name: 'Last Name',
    order_id: 'Order ID',
    order_number: 'Order #',
    order_date: 'Order Date',
    tracking_number: 'Tracking #',
    product_name: 'Product Name',
    company_name: 'Company',
    support_agent: 'Agent Name',
    refund_amount: 'Refund Amount',
    ticket_id: 'Ticket ID',
    email: 'Email Address',
    store_name: 'Store Name',
    issue_type: 'Issue Type',
  };
  return map[v] ?? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Main component ────────────────────────────────────────────────────────────

function EmailTemplatesSection() {
  const { activeOrg } = useAuth();

  const [templates, setTemplates] = useState<DbEmailTemplate[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selected,       setSelected]       = useState<DbEmailTemplate | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    getEmailTemplates(activeOrg.id)
      .then(setTemplates)
      .catch((e) => setError(e.message ?? 'Failed to load templates'))
      .finally(() => setLoading(false));
  }, [activeOrg]);

  const categories = useMemo(() => {
    const set = new Set(templates.map((t) => t.category));
    return ['All', ...Array.from(set)];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return templates.filter((t) => {
      const match =
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.join(' ').toLowerCase().includes(q);
      return match && (categoryFilter === 'All' || t.category === categoryFilter);
    });
  }, [templates, searchTerm, categoryFilter]);

  const customCount = templates.filter((t) => !t.is_default).length;

  const handleUpdate = (updated: DbEmailTemplate, replacedId?: string) => {
    setTemplates((prev) => {
      if (replacedId) return prev.map((t) => (t.id === replacedId ? updated : t));
      return prev.map((t) => (t.id === updated.id ? updated : t));
    });
    setSelected((prev) => {
      if (prev?.id === updated.id || prev?.id === replacedId) return updated;
      return prev;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e: any) {
      setError(e.message ?? 'Delete failed');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ds-text">Email Templates</h1>
        <p className="text-ds-muted text-sm mt-1">
          Your library of ready-to-send email replies. Select a template to edit it.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Search + filter */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-muted" />
            <input
              type="text"
              placeholder="Search templates by name, category, or tag…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-auto bg-ds-surface2"
          >
            <option value="All">All categories</option>
            {categories.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Template list */}
        <div className="xl:col-span-1 card overflow-hidden">
          <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center justify-between">
            <h3 className="font-semibold text-ds-text text-sm">
              Library {!loading && `(${filtered.length})`}
            </h3>
            {customCount > 0 && (
              <span className="text-xs text-ds-muted">{customCount} edited</span>
            )}
          </div>

          <div className="max-h-[680px] overflow-y-auto divide-y divide-ds-borderSoft">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-ds-muted text-sm">
                <Loader2 size={18} className="animate-spin" /> Loading…
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`w-full text-left px-4 py-4 transition-colors border-l-2 ${
                    selected?.id === t.id
                      ? 'bg-ds-accent/5 border-l-ds-accent'
                      : 'border-l-transparent hover:bg-ds-hover/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ds-text text-sm truncate">{t.name}</p>
                      <p className="text-xs text-ds-muted mt-0.5 truncate">{t.description || 'No description'}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${CATEGORY_COLORS[t.category] ?? 'bg-ds-hover text-ds-text2'}`}>
                      {t.category}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {!t.is_default && (
                      <span className="text-xs bg-ds-accent/10 text-ds-accent px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Sparkles size={11} /> Edited
                      </span>
                    )}
                    {t.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs bg-ds-hover text-ds-muted px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-16 text-center">
                <Mail size={28} className="mx-auto mb-3 text-ds-border" />
                <p className="font-medium text-ds-text2 text-sm">No templates found</p>
                <p className="text-xs text-ds-muted mt-1">Try a different search or category</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail / editor */}
        <div className="xl:col-span-2">
          {selected ? (
            <TemplateDetail
              key={selected.id}
              template={selected}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ) : (
            <div className="card p-12 flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-ds-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-ds-accent" />
                </div>
                <p className="text-lg font-semibold text-ds-text mb-2">Select a template to edit</p>
                <p className="text-sm text-ds-muted">
                  Choose any template from the list on the left. Click directly on the email text to make changes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Template detail ───────────────────────────────────────────────────────────

interface DetailProps {
  template: DbEmailTemplate;
  onDelete: (id: string) => void;
  onUpdate: (updated: DbEmailTemplate, replacedId?: string) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type TestStatus = 'idle' | 'sending' | 'sent' | 'error';

function TemplateDetail({ template, onDelete, onUpdate }: DetailProps) {
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
        // First edit of a global default → create an org-scoped copy transparently
        const saved = await createEmailTemplate(activeOrg.id, user.id, {
          name: draft.name, category: draft.category, subject: draft.subject,
          description: draft.description, html_body: draft.html_body,
          variables: draft.variables, tags: draft.tags,
        });
        isDefaultRef.current = false;
        onUpdate(saved, template.id);
      } else {
        const saved = await updateEmailTemplate(draft.id, {
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
    const result = await sendTestEmail({
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

      {/* Card header */}
      <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center gap-3 flex-wrap">
        <input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="input text-sm font-semibold flex-1 min-w-0"
          placeholder="Template name"
        />

        {/* Unsaved indicator */}
        {hasChanges && saveStatus === 'idle' && (
          <span className="text-xs text-amber-400 shrink-0">Unsaved changes</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs text-emerald-400 shrink-0">✓ Saved</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-xs text-red-400 shrink-0">⚠ Save failed — try again</span>
        )}

        {/* Test email */}
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
            : <><Send size={14} /> Test Email</>
          }
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === 'saving'}
          className={`flex items-center gap-2 text-sm shrink-0 transition-all ${
            hasChanges
              ? 'btn-primary'
              : 'btn-primary opacity-40 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saving'
            ? <Loader2 size={14} className="animate-spin" />
            : <Save size={14} />}
          {saveStatus === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>

        {/* Delete (org-owned only) */}
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

      {/* Test email banner */}
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

        {/* Category + customization badge */}
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
                  {group.items.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
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

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <p className="text-xs text-ds-muted mb-1.5">
            A short note shown in the template list to help you find it quickly.
          </p>
          <input
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            className="input text-sm"
            placeholder="e.g. Sent when a customer reports a damaged item"
          />
        </div>

        {/* Subject */}
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

        {/* Email body */}
        <div>
          <label className="label">Email Body</label>
          <VisualEditor
            html={draft.html_body}
            variables={draft.variables}
            onChange={(html) => patch({ html_body: html })}
          />
        </div>

        {/* Personalization fields */}
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
              <div
                key={v}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-ds-surface border border-ds-border rounded-lg text-xs"
              >
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

        {/* Labels */}
        <div>
          <label className="label">Labels</label>
          <p className="text-xs text-ds-muted mb-2">
            Used for search and filtering only — not included in the email.
          </p>
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

// ── Visual email editor with formatting toolbar ───────────────────────────────

function VisualEditor({
  html,
  onChange,
  variables,
}: {
  html: string;
  onChange: (html: string) => void;
  variables: string[];
}) {
  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const onChangeRef = useRef(onChange);
  const dropRef     = useRef<HTMLDivElement>(null);
  const [varDropOpen, setVarDropOpen] = useState(false);

  useEffect(() => { onChangeRef.current = onChange; });

  // Close the Insert Field dropdown when clicking elsewhere
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setVarDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cleanHtml = (raw: string) =>
    raw
      .replace(/<style id="__editor">[\s\S]*?<\/style>/g, '')
      .replace(/ contenteditable="true"/g, '')
      .replace(/ style="outline: none; cursor: text;"/g, '');

  // Execute a rich-text command inside the iframe (Bold, Italic, etc.)
  // onMouseDown + preventDefault on the toolbar buttons keeps the iframe's
  // selection alive so execCommand applies to the right text.
  const execCmd = (cmd: string, val?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(cmd, false, val ?? '');
    onChangeRef.current(cleanHtml(doc.documentElement.outerHTML));
  };

  const insertVar = (varName: string) => {
    execCmd('insertText', `{{${varName}}}`);
    setVarDropOpen(false);
  };

  // Write HTML into the iframe once on mount and wire up contenteditable
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const init = () => {
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(html || '<p style="color:#6b7280;font-family:sans-serif;padding:24px 32px;">No content yet.</p>');
      doc.close();

      doc.querySelectorAll<HTMLElement>('p, li, h1, h2, h3, td').forEach((el) => {
        el.contentEditable = 'true';
        el.style.outline = 'none';
        el.style.cursor = 'text';
      });

      const style = doc.createElement('style');
      style.id = '__editor';
      style.textContent = `
        [contenteditable]:hover { outline: 1px dashed #4DA3FF !important; border-radius: 3px; }
        [contenteditable]:focus { outline: 2px solid  #4DA3FF !important; border-radius: 3px; }
        ::selection { background: rgba(77,163,255,0.2); }
      `;
      doc.head.appendChild(style);

      doc.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName === 'TD') {
          e.preventDefault();
        }
      });

      doc.addEventListener('input', () => {
        onChangeRef.current(cleanHtml(doc.documentElement.outerHTML));
      });
    };

    if (iframe.contentDocument?.readyState === 'complete' || !iframe.src) {
      init();
    } else {
      iframe.addEventListener('load', init, { once: true });
    }
  }, []); // run once on mount — key prop on TemplateDetail handles template switching

  return (
    <div className="rounded-xl border border-ds-borderSoft overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-ds-surface2 border-b border-ds-borderSoft">

        {/* Bold / Italic / Underline */}
        {([
          { label: 'B', title: 'Bold (Ctrl+B)',      cmd: 'bold',      cls: 'font-bold' },
          { label: 'I', title: 'Italic (Ctrl+I)',    cmd: 'italic',    cls: 'italic' },
          { label: 'U', title: 'Underline (Ctrl+U)', cmd: 'underline', cls: 'underline decoration-current' },
        ] as const).map(({ label, title, cmd, cls }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
            className={`w-7 h-7 rounded text-ds-text2 hover:bg-ds-hover hover:text-ds-text transition-colors text-xs flex items-center justify-center ${cls}`}
          >
            {label}
          </button>
        ))}

        <div className="w-px h-4 bg-ds-borderSoft mx-1.5 shrink-0" />

        {/* Insert Field dropdown */}
        {variables.length > 0 && (
          <div className="relative" ref={dropRef}>
            <button
              type="button"
              title="Insert a personalization field at the cursor position"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setVarDropOpen((o) => !o)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded text-xs text-ds-accent hover:bg-ds-accent/10 transition-colors font-medium"
            >
              <span className="font-mono leading-none">{'{}'}</span>
              Insert Field
              <ChevronDown
                size={11}
                className={`transition-transform duration-150 ${varDropOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {varDropOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 bg-ds-surface border border-ds-border rounded-xl shadow-card overflow-hidden min-w-[210px]">
                <p className="px-3 py-2 text-xs text-ds-muted border-b border-ds-borderSoft">
                  Click to insert at cursor
                </p>
                {variables.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertVar(v)}
                    className="w-full text-left px-3 py-2 hover:bg-ds-hover transition-colors flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-ds-text">{varLabel(v)}</span>
                    <span className="text-xs font-mono text-ds-muted shrink-0">{`{{${v}}}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-ds-muted select-none">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Click text in the email to edit
        </div>
      </div>

      {/* Email preview / edit area */}
      <div className="bg-white">
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin"
          title="Email visual editor"
          className="w-full"
          style={{ height: 460, border: 'none', display: 'block' }}
        />
      </div>
    </div>
  );
}

export default EmailTemplatesSection;
