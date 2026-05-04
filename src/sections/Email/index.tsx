import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Sparkles } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import ErrorBanner from '../../components/shared/ErrorBanner';
import { useAuth } from '../../contexts/AuthContext';
import { EmailTemplateModel } from '../../models/EmailTemplateModel';
import type { DbEmailTemplate } from '../../lib/supabase/types';
import { CATEGORY_COLORS } from './emailHelpers';
import TemplateDetail from './components/TemplateDetail';

export default function EmailSection() {
  const { activeOrg } = useAuth();

  const [templates,      setTemplates]      = useState<DbEmailTemplate[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selected,       setSelected]       = useState<DbEmailTemplate | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    EmailTemplateModel.getAll(activeOrg.id)
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
      await EmailTemplateModel.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ds-text">Email Templates</h1>
        <p className="text-ds-muted text-sm mt-1">
          Your library of ready-to-send email replies. Select a template to edit it.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card overflow-hidden">
          <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center justify-between">
            <h3 className="font-semibold text-ds-text text-sm">Library {!loading && `(${filtered.length})`}</h3>
            {customCount > 0 && <span className="text-xs text-ds-muted">{customCount} edited</span>}
          </div>

          <div className="max-h-[680px] overflow-y-auto divide-y divide-ds-borderSoft">
            {loading ? (
              <div className="divide-y divide-ds-borderSoft">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-4 py-4 border-l-2 border-l-transparent">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-36 mb-1.5" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-5 w-16 shrink-0" />
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
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

        <div className="lg:col-span-2">
          {selected ? (
            <TemplateDetail key={selected.id} template={selected} onDelete={handleDelete} onUpdate={handleUpdate} />
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
