import { useState } from 'react';
import { X, Search, Send, Eye, EyeOff, ChevronLeft, Check, Mail } from 'lucide-react';
import { defaultTemplates, CATEGORY_COLORS, type EmailTemplate } from '../data/templates';

interface SendEmailModalProps {
  toEmail?: string;
  toName?: string;
  onClose: () => void;
}

type Step = 'select' | 'compose';

export default function SendEmailModal({ toEmail = '', toName = '', onClose }: SendEmailModalProps) {
  const [step, setStep] = useState<Step>(toEmail ? 'select' : 'select');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showPreview, setShowPreview] = useState(false);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    to: toEmail,
    subject: '',
    content: '',
    variables: {} as Record<string, string>,
  });

  const allCategories = ['All', ...Array.from(new Set(defaultTemplates.map((t) => t.category)))];

  const filteredTemplates = defaultTemplates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: EmailTemplate) => {
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      if (v === 'customer_name' && toName) initialVars[v] = toName;
      else initialVars[v] = '';
    });
    setSelectedTemplate(template);
    setForm({
      to: toEmail,
      subject: template.subject,
      content: template.content,
      variables: initialVars,
    });
    setStep('compose');
  };

  const resolveContent = (text: string) => {
    let result = text;
    Object.entries(form.variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
    });
    return result;
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1800);
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
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Template Selection */}
        {step === 'select' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search + filter */}
            <div className="px-6 pt-4 pb-3 space-y-3 flex-shrink-0">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-9"
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

            {/* Template list */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors leading-tight">
                        {template.name}
                      </p>
                      <span className={`badge flex-shrink-0 ${CATEGORY_COLORS[template.category]}`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{template.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-slate-400">
                    <Mail size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No templates found</p>
                    <p className="text-sm mt-1">Try a different search or category</p>
                  </div>
                )}
              </div>
            </div>

            {/* Or compose from scratch */}
            <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setForm({ to: toEmail, subject: '', content: '', variables: {} });
                  setStep('compose');
                }}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/20 transition-all text-sm font-medium"
              >
                + Compose from scratch (no template)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Compose */}
        {step === 'compose' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* To field */}
              <div>
                <label className="label">To</label>
                <input
                  type="email"
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                  placeholder="recipient@example.com"
                  className="input"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Email subject..."
                  className="input"
                />
              </div>

              {/* Variables */}
              {selectedTemplate && selectedTemplate.variables.length > 0 && (
                <div>
                  <label className="label">Template Variables</label>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-slate-500 mb-3">Fill in the dynamic fields. They'll be inserted into the email automatically.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable}>
                          <label className="block text-xs text-slate-500 mb-1">
                            <code className="bg-slate-200 px-1.5 py-0.5 rounded text-indigo-600 font-mono">{`{{${variable}}}`}</code>
                          </label>
                          <input
                            type="text"
                            value={form.variables[variable] || ''}
                            onChange={(e) =>
                              setForm({ ...form, variables: { ...form.variables, [variable]: e.target.value } })
                            }
                            placeholder={variable.replace(/_/g, ' ')}
                            className="input text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Email Body</label>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showPreview ? 'Edit mode' : 'Preview'}
                  </button>
                </div>
                {showPreview ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="text-xs text-slate-500 mb-3 pb-3 border-b border-slate-200">
                      <span className="font-semibold">Subject:</span> {resolveContent(form.subject) || '(no subject)'}
                    </div>
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {resolveContent(form.content) || '(no content)'}
                    </pre>
                  </div>
                ) : (
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Write your email content here..."
                    rows={10}
                    className="input font-mono text-xs leading-relaxed resize-none"
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-slate-400">
                {selectedTemplate ? (
                  <span>Template: <span className="font-medium text-slate-600">{selectedTemplate.name}</span></span>
                ) : (
                  <span>Custom compose</span>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!form.to || !form.subject || sent}
                  className={`btn-primary transition-all ${sent ? 'bg-emerald-600 hover:bg-emerald-600' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {sent ? (
                    <>
                      <Check size={16} /> Sent!
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
