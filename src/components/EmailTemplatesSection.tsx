import { useEffect, useMemo, useState } from 'react';
import { Copy, Trash2, Plus, Search, Check, Mail, Pencil, Sparkles, Tag } from 'lucide-react';
import SendEmailModal from './SendEmailModal';
import { CATEGORY_COLORS, defaultTemplates, type EmailTemplate, type TemplateCategory } from '../data/templates';

const CUSTOM_TEMPLATES_KEY = 'agentflow.customTemplates.v1';

function generateId() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cryptoAny = crypto as any;
  if (cryptoAny?.randomUUID) return cryptoAny.randomUUID();
  return `custom_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function EmailTemplatesSection() {
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as EmailTemplate[];
      if (Array.isArray(parsed)) setCustomTemplates(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
    } catch {
      // ignore
    }
  }, [customTemplates]);

  const templates = useMemo(() => {
    const merged = [...customTemplates, ...defaultTemplates];
    return merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [customTemplates]);

  const categories = useMemo(() => {
    const set = new Set<string>(templates.map((t) => t.category));
    return ['All', ...Array.from(set)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, categoryFilter]);

  const handleSaveTemplate = (template: EmailTemplate) => {
    if (editingTemplate) {
      setCustomTemplates(customTemplates.map((t) => (t.id === template.id ? template : t)));
      setEditingTemplate(null);
    } else {
      setCustomTemplates([{ ...template, id: generateId(), isCustom: true, createdDate: new Date().toISOString().split('T')[0] }, ...customTemplates]);
    }
    setSelectedTemplate(null);
    setShowForm(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates(customTemplates.filter((t) => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const handleCopyTemplate = (id: string) => {
    const original = templates.find((t) => t.id === id);
    if (!original) return;
    const copy: EmailTemplate = {
      ...original,
      id: generateId(),
      name: `${original.name} (Copy)`,
      isCustom: true,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setCustomTemplates([copy, ...customTemplates]);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  const canEdit = !!selectedTemplate?.isCustom;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pre-made ecommerce templates + your custom versions. Use them for AI agent automations or send one-off emails.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSendModal(true)} className="btn-secondary">
            <Mail size={16} />
            Send to any email
          </button>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            New template
          </button>
        </div>
      </div>

      {showForm && (
        <TemplateForm
          template={
            editingTemplate || {
              id: '',
              name: '',
              category: 'Transactional',
              subject: '',
              content: '',
              isCustom: true,
              variables: [],
              createdDate: new Date().toISOString().split('T')[0],
              description: '',
              tags: [],
            }
          }
          onSave={handleSaveTemplate}
          onCancel={() => {
            setEditingTemplate(null);
            setShowForm(false);
          }}
        />
      )}

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, category, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input w-auto">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Library ({filteredTemplates.length})</h3>
            <span className="text-xs text-slate-400">{customTemplates.length} custom</span>
          </div>
          <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-50">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`w-full text-left px-5 py-4 hover:bg-slate-50/60 transition-colors ${
                    selectedTemplate?.id === t.id ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{t.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{t.description}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${CATEGORY_COLORS[t.category as TemplateCategory] || 'bg-slate-100 text-slate-700'}`}>
                      {t.category}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {t.isCustom && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Sparkles size={12} /> Custom
                      </span>
                    )}
                    {t.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-16 text-center text-slate-400">
                <Mail size={30} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No templates found</p>
                <p className="text-xs mt-1">Try a different search or category</p>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2">
          {selectedTemplate ? (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedTemplate.name}</h3>
                  <div className="flex gap-2 items-center mt-2">
                    <span className={`badge ${CATEGORY_COLORS[selectedTemplate.category as TemplateCategory] || 'bg-slate-100 text-slate-700'}`}>
                      {selectedTemplate.category}
                    </span>
                    {selectedTemplate.isCustom && (
                      <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                        <Sparkles size={12} /> Custom
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyTemplate(selectedTemplate.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Duplicate to custom"
                  >
                    {copiedId === selectedTemplate.id ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                  </button>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => {
                          setEditingTemplate(selectedTemplate);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteTemplate(selectedTemplate.id);
                        }}
                        className="p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {selectedTemplate.description && (
                  <div className="text-sm text-slate-600">
                    {selectedTemplate.description}
                  </div>
                )}

                <div>
                  <label className="label">Subject</label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 break-words">
                    {selectedTemplate.subject}
                  </div>
                </div>

                <div>
                  <label className="label">Body</label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                    {selectedTemplate.content}
                  </div>
                </div>

                {selectedTemplate.variables.length > 0 && (
                  <div>
                    <label className="label">Variables</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable) => (
                        <span key={variable} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setShowSendModal(true)} className="btn-primary">
                    <Mail size={16} />
                    Send using this template
                  </button>
                  <button
                    onClick={() => handleCopyTemplate(selectedTemplate.id)}
                    className="btn-secondary"
                    title="Create a customizable copy"
                  >
                    <Copy size={16} />
                    Duplicate & customize
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 flex items-center justify-center h-full">
              <div className="text-center text-slate-500 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Mail size={20} className="text-indigo-600" />
                </div>
                <p className="text-lg font-semibold text-slate-800 mb-2">Pick a template</p>
                <p className="text-sm">Select a template from the library to preview it, duplicate it, or send it to any email.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSendModal && <SendEmailModal onClose={() => setShowSendModal(false)} />}
    </div>
  );
}

interface TemplateFormProps {
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

function TemplateForm({ template, onSave, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState(template);
  const [variableInput, setVariableInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleAddVariable = () => {
    if (variableInput.trim() && !formData.variables.includes(variableInput.trim())) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput.trim()],
      });
      setVariableInput('');
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((v) => v !== variable),
    });
  };

  const handleAddTag = () => {
    const next = tagInput.trim().replace(/^#/, '');
    if (!next) return;
    if (formData.tags.includes(next)) return;
    setFormData({ ...formData, tags: [...formData.tags, next] });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.subject && formData.content) {
      onSave(formData);
    }
  };

  const categories = Object.keys(CATEGORY_COLORS) as TemplateCategory[];

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{template.id ? 'Edit template' : 'Create template'}</h3>
          <p className="text-sm text-slate-500 mt-1">
            Add variables like{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs">
              {'{{order_id}}'}
            </code>
            .
          </p>
        </div>
        <button onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Template name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Chargeback: request more info"
              required
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="input font-mono text-xs"
            placeholder="e.g., Order Confirmed ✓ — #{{order_id}}"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            placeholder="Short summary shown in the template library"
          />
        </div>

        <div>
          <label className="label">Body</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="input font-mono text-xs leading-relaxed resize-none"
            placeholder="Write the email body. Use {{variable_name}} for dynamic fields."
            rows={10}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="label">Variables</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={variableInput}
              onChange={(e) => setVariableInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariable())}
              placeholder="Variable name (without braces)"
              className="input"
            />
            <button
              type="button"
              onClick={handleAddVariable}
              className="btn-secondary"
            >
              <Plus size={16} /> Add
            </button>
          </div>
          {formData.variables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.variables.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => handleRemoveVariable(variable)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium hover:bg-indigo-200 transition-colors"
                >
                  {`{{${variable}}}`} ✕
                </button>
              ))}
            </div>
          )}
        </div>

          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="e.g. chargeback, urgent, policy"
                className="input"
              />
              <button type="button" onClick={handleAddTag} className="btn-secondary">
                <Tag size={16} /> Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    #{tag} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">
            {template.id ? <><Pencil size={16} /> Update template</> : <><Sparkles size={16} /> Create template</>}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmailTemplatesSection;
