import { useEffect, useState, useCallback } from 'react';
import {
  Bot, Plus, Trash2, Loader2, AlertCircle, CheckCircle2,
  Wand2, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAiConfig, upsertAiConfig } from '../lib/supabase/aiConfigs';
import type { AiConfig } from '../lib/supabase/types';

// ── Constants ─────────────────────────────────────────────────────────────────

const TONE_OPTIONS = [
  'Professional',
  'Friendly',
  'Formal',
  'Casual',
  'Empathetic',
  'Direct',
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

// ── Form state type ────────────────────────────────────────────────────────────

interface FormState {
  general_prompt: string;
  tone: string;
  rules: string[];
  vector_namespace: string;
  vector_id: string;
}

function configToForm(config: AiConfig | null): FormState {
  return {
    general_prompt: config?.general_prompt ?? '',
    tone: config?.tone ?? 'Professional',
    rules: config?.rules ?? [],
    vector_namespace: config?.vector_namespace ?? '',
    vector_id: config?.vector_id ?? '',
  };
}

function formsEqual(a: FormState, b: FormState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIConfigSection() {
  const { activeOrg } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState<FormState>(configToForm(null));
  const [form, setForm] = useState<FormState>(configToForm(null));
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  const isDirty = !formsEqual(form, saved);

  // ── Load ───────────────────────────────────────────────────────────────────

  const load = useCallback(async (orgId: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const config = await getAiConfig(orgId);
      const formState = configToForm(config);
      setSaved(formState);
      setForm(formState);
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSaveResult(null);
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function fillSample() {
    set('general_prompt', SAMPLE_PROMPT);
  }

  function resetForm() {
    setForm(saved);
    setSaveResult(null);
  }

  // Rules helpers
  function addRule() {
    set('rules', [...form.rules, '']);
  }

  function updateRule(index: number, value: string) {
    const next = [...form.rules];
    next[index] = value;
    set('rules', next);
  }

  function removeRule(index: number) {
    set('rules', form.rules.filter((_, i) => i !== index));
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!activeOrg || !isDirty) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const saved = await upsertAiConfig({
        organization_id: activeOrg.id,
        general_prompt: form.general_prompt || null,
        tone: form.tone || null,
        rules: form.rules.filter(r => r.trim() !== ''),
        vector_namespace: form.vector_namespace || null,
        vector_id: form.vector_id || null,
      });
      const newForm = configToForm(saved);
      setSaved(newForm);
      setForm(newForm);
      setSaveResult({ ok: true, message: 'Configuration saved successfully.' });
    } catch (err: any) {
      setSaveResult({ ok: false, message: err?.message ?? 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  }

  // ── No org guard ───────────────────────────────────────────────────────────

  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-4">
          <Bot size={24} className="text-ds-muted" />
        </div>
        <p className="text-ds-text2 text-sm font-medium">No organization found</p>
        <p className="text-ds-muted text-xs mt-1">Select an organization to configure AI settings.</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className={`space-y-5 animate-fade-in ${isDirty ? 'pb-24' : ''}`}>

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ds-text">AI Configuration</h1>
            <p className="text-ds-muted text-sm mt-1">
              Define how the AI behaves across your automation workflows.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ds-surface2 border border-ds-borderSoft rounded-xl flex-shrink-0">
            <Bot size={13} className="text-ds-accent" />
            <span className="text-ds-text2 text-xs font-medium">Automation AI</span>
          </div>
        </div>

        {/* Load error */}
        {loadError && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
            <AlertCircle size={15} className="shrink-0" />
            {loadError}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-2 text-ds-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading configuration…</span>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* ── General Prompt ─────────────────────────────────────────── */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-ds-text">General Prompt</h2>
                  <p className="text-ds-muted text-xs mt-0.5">
                    Core instructions, context, and rules the AI follows when generating responses. Think of this as the system prompt for your automations.
                  </p>
                </div>
                <button
                  onClick={fillSample}
                  className="btn-secondary flex-shrink-0 text-xs gap-1.5"
                >
                  <Wand2 size={13} />
                  Fill sample
                </button>
              </div>
              <textarea
                value={form.general_prompt}
                onChange={e => set('general_prompt', e.target.value)}
                rows={10}
                placeholder="E.g. You are a customer support assistant for an e-commerce brand. Always address customers by first name, reference their order details, and end every message with a clear next step…"
                className="input w-full resize-none font-mono text-xs leading-relaxed"
              />
              <p className="text-ds-muted text-[11px] mt-2">
                {form.general_prompt.length > 0
                  ? `${form.general_prompt.length} characters`
                  : 'No prompt set — the AI will use default behavior.'}
              </p>
            </div>

            {/* ── Tone + Vector ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Tone */}
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
                {/* Custom tone input */}
                <div className="mt-4">
                  <label className="label">Custom tone</label>
                  <input
                    className="input"
                    placeholder="E.g. Witty and concise"
                    value={TONE_OPTIONS.includes(form.tone) ? '' : form.tone}
                    onChange={e => set('tone', e.target.value)}
                    onFocus={() => {
                      if (TONE_OPTIONS.includes(form.tone)) set('tone', '');
                    }}
                  />
                  <p className="text-ds-muted text-[11px] mt-1.5">
                    Type a custom tone or use a preset above.
                  </p>
                </div>
              </div>

              {/* Vector config */}
              <div className="card p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-ds-text mb-0.5">Vector Store</h2>
                  <p className="text-ds-muted text-xs">
                    Connect a vector namespace for RAG-based knowledge retrieval in your workflows.
                  </p>
                </div>
                <div>
                  <label className="label">Namespace</label>
                  <input
                    className="input font-mono bg-ds-hover text-ds-muted cursor-not-allowed select-all"
                    value={form.vector_namespace || '—'}
                    readOnly
                  />
                  <p className="text-ds-muted text-[11px] mt-1.5">
                    The namespace in your vector store (Pinecone, Qdrant, etc.)
                  </p>
                </div>
                <div>
                  <label className="label">Index / Collection ID</label>
                  <input
                    className="input font-mono bg-ds-hover text-ds-muted cursor-not-allowed select-all"
                    value={form.vector_id || '—'}
                    readOnly
                  />
                  <p className="text-ds-muted text-[11px] mt-1.5">
                    The specific index or collection to query.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Rules ──────────────────────────────────────────────────── */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-ds-text">Rules</h2>
                  <p className="text-ds-muted text-xs mt-0.5">
                    Individual constraints, FAQs, policies, or hard instructions the AI must always follow. Each rule is injected separately into the workflow context.
                  </p>
                </div>
                <button onClick={addRule} className="btn-secondary flex-shrink-0 text-xs gap-1.5">
                  <Plus size={13} />
                  Add rule
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
                    <Plus size={13} />
                    Add first rule
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
                        title="Remove rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addRule}
                    className="flex items-center gap-1.5 text-xs text-ds-muted hover:text-ds-text2 transition mt-1 px-1"
                  >
                    <Plus size={12} />
                    Add another rule
                  </button>
                </div>
              )}
            </div>

            {/* ── Save result banner ─────────────────────────────────────── */}
            {saveResult && (
              <div
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                  saveResult.ok
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                {saveResult.ok
                  ? <CheckCircle2 size={15} className="shrink-0" />
                  : <AlertCircle size={15} className="shrink-0" />
                }
                {saveResult.message}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Sticky save bar ─────────────────────────────────────────────────── */}
      {isDirty && (
        <div className="fixed bottom-0 left-60 right-0 z-50 border-t border-ds-border bg-ds-surface/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-ds-text2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetForm}
                disabled={saving}
                className="btn-secondary gap-1.5 disabled:opacity-50"
              >
                <RotateCcw size={13} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : 'Save changes'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
