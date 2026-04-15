import { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Search, Mail, Tag, X, Loader2, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '../lib/supabase/emailTemplates';
import type { DbEmailTemplate } from '../lib/supabase/types';

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES = [
  'Quality Issue', 'Wrong Item', 'Color Mismatch', 'Sizing Complaint',
  'Missing Package', 'Partial Order', 'Refund Delayed', 'Active Dispute',
  'Escalation Threat', 'Order Not Found', 'Sizing Inquiry', 'Shipping Delay',
  'Customs Hold', 'Misdirected Email', 'Repeat Contact', 'Privacy Breach',
  'Positive Feedback',
  'Transactional', 'Returns & Refunds', 'Financial', 'Support',
  'Marketing', 'Security', 'Operations', 'B2B',
] as const;

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
  Transactional:        'bg-indigo-500/10 text-indigo-400',
  'Returns & Refunds':  'bg-amber-500/10  text-amber-400',
  Financial:            'bg-emerald-500/10 text-emerald-400',
  Support:              'bg-blue-500/10   text-blue-400',
  Marketing:            'bg-pink-500/10   text-pink-400',
  Security:             'bg-red-500/10    text-red-400',
  Operations:           'bg-ds-hover      text-ds-text2',
  B2B:                  'bg-violet-500/10 text-violet-400',
};

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

  // ── Handlers ────────────────────────────────────────────────────────────────

  // replacedId: when a global default is first edited, we create an org copy
  // and replace the default entry in the list with the new copy
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
          Click any template to edit it. Changes save automatically to Supabase.
          n8n reads the category and body to send the right email for each intent.
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
              placeholder="Search by name, category, description, or tags…"
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
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
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
              Library ({loading ? '…' : filtered.length})
            </h3>
            <span className="text-xs text-ds-muted">{customCount} edited</span>
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
                  className={`w-full text-left px-5 py-4 transition-colors ${
                    selected?.id === t.id ? 'bg-ds-accent/5' : 'hover:bg-ds-hover/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-ds-text text-sm truncate">{t.name}</p>
                      <p className="text-xs text-ds-muted mt-0.5 truncate">{t.description}</p>
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
            <div className="card p-12 flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-ds-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Mail size={20} className="text-ds-accent" />
                </div>
                <p className="text-lg font-semibold text-ds-text mb-2">Pick a template</p>
                <p className="text-sm text-ds-muted">
                  Select any template from the list. Click directly on the email body to edit text — changes save automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Template detail with inline editing ──────────────────────────────────────

interface DetailProps {
  template: DbEmailTemplate;
  onDelete: (id: string) => void;
  onUpdate: (updated: DbEmailTemplate, replacedId?: string) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function TemplateDetail({ template, onDelete, onUpdate }: DetailProps) {
  const { user, activeOrg } = useAuth();

  const [draft,    setDraft]    = useState<DbEmailTemplate>(template);
  const [status,   setStatus]   = useState<SaveStatus>('idle');
  const [varInput, setVarInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track if the current template is still a global default (first-save will create org copy)
  const isDefaultRef = useRef(template.is_default && template.organization_id === null);

  useEffect(() => {
    setDraft(template);
    setStatus('idle');
    isDefaultRef.current = template.is_default && template.organization_id === null;
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [template.id]);

  const scheduleSave = (next: DbEmailTemplate) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');

    timerRef.current = setTimeout(async () => {
      try {
        if (isDefaultRef.current && activeOrg && user) {
          // First edit of a global default → create an org-scoped copy transparently
          const saved = await createEmailTemplate(activeOrg.id, user.id, {
            name: next.name, category: next.category, subject: next.subject,
            description: next.description, html_body: next.html_body,
            variables: next.variables, tags: next.tags,
          });
          isDefaultRef.current = false;
          onUpdate(saved, template.id); // replace old default in list
        } else {
          const saved = await updateEmailTemplate(next.id, {
            name: next.name, category: next.category, subject: next.subject,
            description: next.description, html_body: next.html_body,
            variables: next.variables, tags: next.tags,
          });
          onUpdate(saved);
        }
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch {
        setStatus('error');
      }
    }, 1200);
  };

  const patch = (changes: Partial<DbEmailTemplate>) => {
    const next = { ...draft, ...changes };
    setDraft(next);
    scheduleSave(next);
  };

  const addVar = () => {
    const v = varInput.trim();
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

  return (
    <div className="card overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center gap-3">
        <input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="input text-sm font-semibold flex-1"
          placeholder="Template name"
        />

        {/* Save status */}
        <span className={`text-xs shrink-0 transition-opacity duration-200 ${status === 'idle' ? 'opacity-0' : 'opacity-100'} ${
          status === 'saved' ? 'text-emerald-400' :
          status === 'error' ? 'text-red-400' : 'text-ds-muted'
        }`}>
          {status === 'saving' && <><Loader2 size={11} className="inline animate-spin mr-1" />Saving…</>}
          {status === 'saved'  && '✓ Saved'}
          {status === 'error'  && '⚠ Error saving'}
        </span>

        {/* Delete (only for org-owned templates, not untouched globals) */}
        {!template.is_default && (
          <button
            onClick={() => onDelete(template.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-ds-muted hover:text-red-400 transition-colors shrink-0"
            title="Delete template"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="p-6 space-y-5">

        {/* Category + status badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={draft.category}
            onChange={(e) => patch({ category: e.target.value })}
            className="input w-auto bg-ds-surface2 text-xs"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {template.is_default ? (
            <span className="text-xs text-ds-muted">Default — edit to customize for your org</span>
          ) : (
            <span className="text-xs text-ds-accent inline-flex items-center gap-1">
              <Sparkles size={11} /> Customized
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <input
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            className="input text-sm"
            placeholder="Short summary shown in the library…"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="label">Subject</label>
          <input
            value={draft.subject}
            onChange={(e) => patch({ subject: e.target.value })}
            className="input font-mono text-xs"
            placeholder="Email subject…"
          />
        </div>

        {/* Visual body editor */}
        <div>
          <label className="label">Email Body</label>
          <VisualEditor
            html={draft.html_body}
            onChange={(html) => patch({ html_body: html })}
          />
        </div>

        {/* Variables */}
        <div>
          <label className="label">Variables</label>
          <div className="flex flex-wrap gap-2">
            {draft.variables.map((v) => (
              <button
                key={v}
                onClick={() => patch({ variables: draft.variables.filter((x) => x !== v) })}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-ds-accent/10 text-ds-accent rounded-full text-xs font-medium font-mono hover:bg-ds-accent/20 transition-colors"
              >
                {`{{${v}}}`} <X size={10} />
              </button>
            ))}
            <div className="flex gap-1.5 items-center">
              <input
                value={varInput}
                onChange={(e) => setVarInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVar())}
                placeholder="new_var"
                className="input h-7 text-xs font-mono px-2 w-28"
              />
              <button onClick={addVar} className="btn-ghost h-7 px-2 text-xs">
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <div className="flex flex-wrap gap-2">
            {draft.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => patch({ tags: draft.tags.filter((x) => x !== tag) })}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-ds-hover text-ds-text2 rounded-full text-xs hover:bg-ds-border transition-colors"
              >
                #{tag} <X size={10} />
              </button>
            ))}
            <div className="flex gap-1.5 items-center">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="tag"
                className="input h-7 text-xs px-2 w-20"
              />
              <button onClick={addTag} className="btn-ghost h-7 px-2 text-xs">
                <Tag size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Visual (contenteditable) email editor ─────────────────────────────────────

function VisualEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const onChangeRef = useRef(onChange);

  // Keep callback ref fresh on every render so stale closures never fire
  useEffect(() => { onChangeRef.current = onChange; });

  // Write HTML once on mount and wire up contenteditable
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const init = () => {
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(html || '<p style="color:#6b7280;font-family:sans-serif;padding:24px 32px;">No content yet.</p>');
      doc.close();

      // Make text-bearing elements editable
      doc.querySelectorAll<HTMLElement>('p, li, h1, h2, h3, td').forEach((el) => {
        el.contentEditable = 'true';
        el.style.outline = 'none';
        el.style.cursor = 'text';
      });

      // Inject hover/focus styles
      const style = doc.createElement('style');
      style.id = '__editor';
      style.textContent = `
        [contenteditable]:hover { outline: 1px dashed #4DA3FF !important; border-radius: 3px; }
        [contenteditable]:focus { outline: 2px solid #4DA3FF !important; border-radius: 3px; }
      `;
      doc.head.appendChild(style);

      // Prevent Enter from splitting <td> rows
      doc.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName === 'TD') {
          e.preventDefault();
        }
      });

      // Fire onChange with clean HTML (strip editing artifacts before saving)
      doc.addEventListener('input', () => {
        let raw = doc.documentElement.outerHTML;
        // Strip injected style and contenteditable attributes before saving
        raw = raw.replace(/<style id="__editor">[\s\S]*?<\/style>/g, '');
        raw = raw.replace(/ contenteditable="true"/g, '');
        raw = raw.replace(/ style="outline: none; cursor: text;"/g, '');
        onChangeRef.current(raw);
      });
    };

    // iframe may already be ready or not yet loaded
    if (iframe.contentDocument?.readyState === 'complete' || !iframe.src) {
      init();
    } else {
      iframe.addEventListener('load', init, { once: true });
    }
  }, []); // run once on mount — key prop on parent handles template switching

  return (
    <div className="rounded-xl border border-ds-borderSoft overflow-hidden bg-white">
      <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-600 flex items-center gap-1.5 select-none">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Click on any text in the email below to edit it
      </div>
      <iframe
        ref={iframeRef}
        sandbox="allow-same-origin"
        title="Email visual editor"
        className="w-full"
        style={{ height: 400, border: 'none', display: 'block' }}
      />
    </div>
  );
}

export default EmailTemplatesSection;
