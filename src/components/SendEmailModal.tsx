import { useEffect, useRef, useState } from 'react';
import { X, Search, Send, Eye, Code2, ChevronLeft, Check, Mail } from 'lucide-react';
import type { DbEmailTemplate } from '../lib/supabase/types';

const CATEGORY_COLORS: Record<string, string> = {
  Transactional:      'bg-indigo-100 text-indigo-700',
  'Returns & Refunds':'bg-amber-100  text-amber-700',
  Financial:          'bg-emerald-100 text-emerald-700',
  Support:            'bg-blue-100   text-blue-700',
  Marketing:          'bg-pink-100   text-pink-700',
  Security:           'bg-red-100    text-red-700',
  Operations:         'bg-slate-100  text-slate-700',
  B2B:                'bg-violet-100 text-violet-700',
};

interface SendEmailModalProps {
  toEmail?: string;
  toName?: string;
  templates?: DbEmailTemplate[];
  onClose: () => void;
}

type Step = 'select' | 'compose';

export default function SendEmailModal({
  toEmail = '',
  toName = '',
  templates = [],
  onClose,
}: SendEmailModalProps) {
  const [step, setStep]                   = useState<Step>('select');
  const [selected, setSelected]           = useState<DbEmailTemplate | null>(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [bodyTab, setBodyTab]             = useState<'preview' | 'code'>('preview');
  const [sent, setSent]                   = useState(false);

  const [form, setForm] = useState({
    to: toEmail,
    subject: '',
    html_body: '',
    variables: {} as Record<string, string>,
  });

  const allCategories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filtered = templates.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    return matchSearch && (categoryFilter === 'All' || t.category === categoryFilter);
  });

  const handleSelect = (t: DbEmailTemplate) => {
    const vars: Record<string, string> = {};
    t.variables.forEach((v) => { vars[v] = v === 'customer_name' && toName ? toName : ''; });
    setSelected(t);
    setForm({ to: toEmail, subject: t.subject, html_body: t.html_body, variables: vars });
    setStep('compose');
  };

  const resolvedHtml = (() => {
    let html = form.html_body;
    Object.entries(form.variables).forEach(([k, v]) => {
      html = html.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`);
    });
    return html;
  })();

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === 'compose' && (
              <button
                onClick={() => setStep('select')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Mail size={15} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                {step === 'select' ? 'Select Email Template' : `Compose Email${toName ? ` — ${toName}` : ''}`}
              </h2>
              {toEmail && <p className="text-xs text-slate-400">To: {toEmail}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step 1 — Template selection */}
        {step === 'select' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 pt-4 pb-3 space-y-3 flex-shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pl-9 text-sm outline-none focus:border-indigo-400"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t)}
                    className="text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors leading-tight">
                        {t.name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${CATEGORY_COLORS[t.category] ?? 'bg-slate-100 text-slate-600'}`}>
                        {t.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{t.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {t.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-slate-400">
                    <Mail size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No templates found</p>
                    <p className="text-sm mt-1">Try a different search or category</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => {
                  setSelected(null);
                  setForm({ to: toEmail, subject: '', html_body: '', variables: {} });
                  setStep('compose');
                }}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/20 transition-all text-sm font-medium"
              >
                + Compose from scratch (no template)
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Compose */}
        {step === 'compose' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">To</label>
                <input
                  type="email"
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Email subject…"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              {/* Variable fill-in */}
              {selected && selected.variables.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Template Variables</label>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-slate-500">Fill in the dynamic fields — they'll be replaced in the HTML automatically.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selected.variables.map((v) => (
                        <div key={v}>
                          <label className="block text-xs text-slate-500 mb-1">
                            <code className="bg-slate-200 px-1.5 py-0.5 rounded text-indigo-600 font-mono">{`{{${v}}}`}</code>
                          </label>
                          <input
                            type="text"
                            value={form.variables[v] ?? ''}
                            onChange={(e) =>
                              setForm({ ...form, variables: { ...form.variables, [v]: e.target.value } })
                            }
                            placeholder={v.replace(/_/g, ' ')}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Body preview / code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-600">Email Body</label>
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setBodyTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        bodyTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      <Eye size={11} /> Preview
                    </button>
                    <button
                      onClick={() => setBodyTab('code')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        bodyTab === 'code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      <Code2 size={11} /> HTML
                    </button>
                  </div>
                </div>
                {bodyTab === 'preview' ? (
                  <ModalHtmlPreview html={resolvedHtml} />
                ) : (
                  <textarea
                    value={form.html_body}
                    onChange={(e) => setForm({ ...form, html_body: e.target.value })}
                    placeholder="HTML email body…"
                    rows={10}
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-xs font-mono outline-none focus:border-indigo-400 resize-none leading-relaxed"
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-slate-400">
                {selected
                  ? <span>Template: <span className="font-medium text-slate-600">{selected.name}</span></span>
                  : <span>Custom compose</span>}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!form.to || !form.subject || sent}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    sent ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {sent ? <><Check size={15} /> Sent!</> : <><Send size={15} /> Send Email</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalHtmlPreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html || '<p style="color:#9ca3af;font-family:sans-serif;padding:24px 32px;">No content yet. Fill in variables or switch to HTML mode.</p>');
    doc.close();
  }, [html]);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <iframe
        ref={iframeRef}
        sandbox="allow-same-origin"
        title="Email preview"
        style={{ width: '100%', height: 280, border: 'none', display: 'block' }}
      />
    </div>
  );
}
