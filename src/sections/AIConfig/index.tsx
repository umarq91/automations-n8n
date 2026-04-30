import { useEffect, useState, useCallback } from 'react';
import {
  Bot, Plus, Trash2, Loader2, AlertCircle, CheckCircle2,
  Wand2, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AiConfigModel } from '../../models/AiConfigModel';
import type { AiConfig } from '../../lib/supabase/types';
import EmptyState from '../../components/shared/EmptyState';
import KnowledgeUploadCard from './components/KnowledgeUploadCard';

const TONE_OPTIONS = [
  'Professional', 'Friendly', 'Formal', 'Casual', 'Empathetic', 'Direct',
];

const SAMPLE_PROMPT = `GOAL:
Write short, natural email replies that feel like they were written quickly by a real human during a busy workday.

CORE BEHAVIOR:
- Use simple, everyday language.
- Keep responses short and focused (3–5 sentences max).
- Be calm, helpful, and direct.
- Sound human, not robotic or overly polished.
- Adjust tone based on the customer's message (confused, frustrated, asking for info, etc.).

WRITING STYLE:
- Start with a natural, context-aware opening line based on the customer's message.
- Do not use generic openings like "Hey there", "Hello there", or similar.
- The first line must feel specific to the situation.
- Vary sentence structure naturally.
- Avoid repetitive phrasing.
- Do not sound scripted.

STRICT RULES:
- Do not include email signatures or sign-offs.
- Do not include company name, emails, or contact details.
- Do not mention internal processes or systems.
- Do not say "Thank you for reaching out" unless it genuinely fits.
- Do not expose support channels.
- Do not use emojis.

VECTOR STORE RULE:
- Use only the provided vector store information to answer.
- If information is missing, respond exactly:
  "I don't have enough information to answer this. Please contact support for further assistance."

OUTPUT RULE:
- Return only the email body text.
- No subject line.
- No explanations.
- No formatting.`;

interface FormState {
  general_prompt: string;
  tone: string;
  rules: string[];
}

interface VectorState {
  seo_vector_namespace: string | null;
  seo_vector_id: string | null;
  bannable_words_vector_namespace: string | null;
  bannable_words_vector_id: string | null;
}

function configToForm(config: AiConfig | null): FormState {
  return {
    general_prompt: config?.general_prompt ?? '',
    tone: config?.tone ?? 'Professional',
    rules: config?.rules ?? [],
  };
}

function configToVectors(config: AiConfig | null): VectorState {
  return {
    seo_vector_namespace: config?.seo_vector_namespace ?? null,
    seo_vector_id: config?.seo_vector_id ?? null,
    bannable_words_vector_namespace: config?.bannable_words_vector_namespace ?? null,
    bannable_words_vector_id: config?.bannable_words_vector_id ?? null,
  };
}

function formsEqual(a: FormState, b: FormState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function AIConfigSection() {
  const { activeOrg } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState<FormState>(configToForm(null));
  const [form, setForm] = useState<FormState>(configToForm(null));
  const [vectors, setVectors] = useState<VectorState>(configToVectors(null));
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  const isDirty = !formsEqual(form, saved);

  const load = useCallback(async (orgId: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const config = await AiConfigModel.get(orgId);
      const formState = configToForm(config);
      setSaved(formState);
      setForm(formState);
      setVectors(configToVectors(config));
    } catch (err: any) {
      setLoadError(err?.message ?? 'Failed to load AI configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeOrg) return;
    load(activeOrg.id);
  }, [activeOrg?.id, load]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSaveResult(null);
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function fillSample() { set('general_prompt', SAMPLE_PROMPT); }
  function resetForm() { setForm(saved); setSaveResult(null); }
  function addRule() { set('rules', [...form.rules, '']); }
  function updateRule(index: number, value: string) {
    const next = [...form.rules]; next[index] = value; set('rules', next);
  }
  function removeRule(index: number) {
    set('rules', form.rules.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!activeOrg || !isDirty) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const result = await AiConfigModel.upsert({
        organization_id: activeOrg.id,
        general_prompt: form.general_prompt || null,
        tone: form.tone || null,
        rules: form.rules.filter(r => r.trim() !== ''),
      });
      const newForm = configToForm(result);
      setSaved(newForm);
      setForm(newForm);
      setSaveResult({ ok: true, message: 'Configuration saved successfully.' });
    } catch (err: any) {
      setSaveResult({ ok: false, message: err?.message ?? 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  }

  if (!activeOrg) {
    return <EmptyState icon={<Bot size={24} className="text-ds-muted" />} title="No organization found" description="Select an organization to configure AI settings." />;
  }

  return (
    <>
      <div className={`space-y-5 animate-fade-in ${isDirty ? 'pb-24' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ds-text">AI Configuration</h1>
            <p className="text-ds-muted text-sm mt-1">Define how the AI behaves across your automation workflows.</p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ds-surface2 border border-ds-borderSoft rounded-xl shrink-0">
            <Bot size={13} className="text-ds-accent" />
            <span className="text-ds-text2 text-xs font-medium">Automation AI</span>
          </div>
        </div>

        {loadError && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
            <AlertCircle size={15} className="shrink-0" />
            {loadError}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-24 gap-2 text-ds-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading configuration…</span>
          </div>
        )}

        {!loading && !loadError && (
          <>
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-ds-text">General Prompt</h2>
                  <p className="text-ds-muted text-xs mt-0.5">
                    Core instructions, context, and rules the AI follows when generating responses.
                  </p>
                </div>
                <button onClick={fillSample} className="btn-secondary flex-shrink-0 text-xs gap-1.5">
                  <Wand2 size={13} /> Fill sample
                </button>
              </div>
              <textarea
                value={form.general_prompt}
                onChange={e => set('general_prompt', e.target.value)}
                rows={10}
                placeholder="E.g. You are a customer support assistant for an e-commerce brand…"
                className="input w-full resize-none font-mono text-xs leading-relaxed"
              />
              <p className="text-ds-muted text-[11px] mt-2">
                {form.general_prompt.length > 0
                  ? `${form.general_prompt.length} characters`
                  : 'No prompt set — the AI will use default behavior.'}
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-sm font-semibold text-ds-text mb-0.5">Response Tone</h2>
              <p className="text-ds-muted text-xs mb-4">How the AI should communicate with customers.</p>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map(tone => (
                  <button
                    key={tone}
                    onClick={() => set('tone', tone)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      form.tone === tone
                        ? 'bg-ds-accent/15 text-ds-accent border-ds-accent/40'
                        : 'bg-ds-surface2 text-ds-text2 border-ds-borderSoft hover:border-ds-border hover:text-ds-text'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="label">Custom tone</label>
                <input
                  className="input"
                  placeholder="E.g. Witty and concise"
                  value={TONE_OPTIONS.includes(form.tone) ? '' : form.tone}
                  onChange={e => set('tone', e.target.value)}
                  onFocus={() => { if (TONE_OPTIONS.includes(form.tone)) set('tone', ''); }}
                />
                <p className="text-ds-muted text-[11px] mt-1.5">Type a custom tone or use a preset above.</p>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-ds-text">Rules</h2>
                  <p className="text-ds-muted text-xs mt-0.5">
                    Individual constraints, FAQs, policies, or hard instructions the AI must always follow.
                  </p>
                </div>
                <button onClick={addRule} className="btn-secondary flex-shrink-0 text-xs gap-1.5">
                  <Plus size={13} /> Add rule
                </button>
              </div>

              {form.rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-ds-borderSoft rounded-xl gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ds-surface2 flex items-center justify-center">
                    <Plus size={18} className="text-ds-muted" />
                  </div>
                  <div>
                    <p className="text-ds-text2 text-sm font-medium">No rules yet</p>
                    <p className="text-ds-muted text-xs mt-0.5">Add rules like policies, FAQs, or hard constraints.</p>
                  </div>
                  <button onClick={addRule} className="btn-primary text-xs gap-1.5">
                    <Plus size={13} /> Add first rule
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {form.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-ds-surface2 border border-ds-borderSoft flex items-center justify-center text-[10px] font-bold text-ds-muted flex-shrink-0 select-none">
                        {i + 1}
                      </span>
                      <input
                        className="input flex-1"
                        placeholder={`Rule ${i + 1} — e.g. Never offer a refund above $200 without manager approval`}
                        value={rule}
                        onChange={e => updateRule(i, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addRule();
                          if (e.key === 'Backspace' && rule === '') removeRule(i);
                        }}
                        autoFocus={i === form.rules.length - 1 && rule === ''}
                      />
                      <button
                        onClick={() => removeRule(i)}
                        className="p-1.5 rounded-lg text-ds-muted hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addRule}
                    className="flex items-center gap-1.5 text-xs text-ds-muted hover:text-ds-text2 transition mt-1 px-1"
                  >
                    <Plus size={12} /> Add another rule
                  </button>
                </div>
              )}
            </div>

            <KnowledgeUploadCard
              title="SEO Knowledge Base"
              description="Upload SEO guidelines the AI references when generating product listings and descriptions."
              domain="seo"
              activeNamespace={vectors.seo_vector_namespace}
              onUploaded={(ns, id) => setVectors(prev => ({ ...prev, seo_vector_namespace: ns, seo_vector_id: id }))}
            />

            <KnowledgeUploadCard
              title="Banned Words"
              description="Upload a list of words or phrases the AI must never use in generated content."
              domain="banned_words"
              activeNamespace={vectors.bannable_words_vector_namespace}
              onUploaded={(ns, id) => setVectors(prev => ({ ...prev, bannable_words_vector_namespace: ns, bannable_words_vector_id: id }))}
            />

            {saveResult && (
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                saveResult.ok
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {saveResult.ok ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
                {saveResult.message}
              </div>
            )}
          </>
        )}
      </div>

      {isDirty && (
        <div className="fixed bottom-0 left-0 lg:left-60 right-0 z-50 border-t border-ds-border bg-ds-surface/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-ds-text2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </div>
            <div className="flex items-center gap-3">
              <button onClick={resetForm} disabled={saving} className="btn-secondary gap-1.5 disabled:opacity-50">
                <RotateCcw size={13} /> Reset
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
