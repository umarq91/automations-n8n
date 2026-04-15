import { useEffect, useState } from 'react';
import {
  Plug, CheckCircle2, AlertCircle, Loader2, X,
  ShoppingBag, MessageCircle, Trash2, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getIntegrations,
  upsertIntegration,
  deleteIntegration,
  testIntegrationCredentials,
  type TestResult,
} from '../lib/supabase/integrations';
import type {
  Integration,
  ShopifyCredentials,
  ReamazeCredentials,
} from '../lib/supabase/types';

// ── Provider metadata ────────────────────────────────────────────────────────

const PROVIDERS = {
  shopify: {
    label: 'Shopify',
    description: 'Connect your Shopify store to sync orders, products, and customers.',
    icon: ShoppingBag,
    gradient: 'gradient-emerald',
    category: 'ecommerce',
    auth_type: 'api_key',
  },
  reamaze: {
    label: 'Reamaze',
    description: 'Connect Reamaze to manage customer support conversations.',
    icon: MessageCircle,
    gradient: 'gradient-violet',
    category: 'support',
    auth_type: 'basic',
  },
} as const;

// ── Credential forms ─────────────────────────────────────────────────────────

function ShopifyForm({
  value,
  onChange,
  disabled,
}: {
  value: ShopifyCredentials;
  onChange: (v: ShopifyCredentials) => void;
  disabled: boolean;
}) {
  const [showToken, setShowToken] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Shop Domain</label>
        <input
          className="input"
          placeholder="mystore.myshopify.com"
          value={value.shop_domain}
          onChange={e => onChange({ ...value, shop_domain: e.target.value.trim() })}
          disabled={disabled}
          autoComplete="off"
        />
        <p className="text-ds-muted text-[11px] mt-1.5">Your Shopify store URL (include .myshopify.com)</p>
      </div>
      <div>
        <label className="label">Admin API Access Token</label>
        <div className="relative">
          <input
            className="input pr-10"
            type={showToken ? 'text' : 'password'}
            placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
            value={value.access_token}
            onChange={e => onChange({ ...value, access_token: e.target.value.trim() })}
            disabled={disabled}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowToken(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-muted hover:text-ds-text2 transition"
          >
            {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-ds-muted text-[11px] mt-1.5">
          Found in Shopify Admin → Apps → Develop apps → your app → Admin API access token
        </p>
      </div>
    </div>
  );
}

function ReamazeForm({
  value,
  onChange,
  disabled,
}: {
  value: ReamazeCredentials;
  onChange: (v: ReamazeCredentials) => void;
  disabled: boolean;
}) {
  const [showKey, setShowKey] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Account Subdomain</label>
        <div className="flex items-center gap-0">
          <span className="px-3 py-2.5 bg-ds-hover border border-ds-border border-r-0 rounded-l-xl text-ds-muted text-sm select-none">
            https://
          </span>
          <input
            className="flex-1 px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-none text-sm text-ds-text
                       placeholder-ds-muted focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/60 transition-all"
            placeholder="mystore"
            value={value.subdomain}
            onChange={e => onChange({ ...value, subdomain: e.target.value.trim() })}
            disabled={disabled}
            autoComplete="off"
          />
          <span className="px-3 py-2.5 bg-ds-hover border border-ds-border border-l-0 rounded-r-xl text-ds-muted text-sm select-none">
            .reamaze.com
          </span>
        </div>
        <p className="text-ds-muted text-[11px] mt-1.5">Your Reamaze account subdomain</p>
      </div>
      <div>
        <label className="label">Login Email</label>
        <input
          className="input"
          type="text"
          placeholder="support@automations.reamaze.com"
          value={value.email}
          onChange={e => onChange({ ...value, email: e.target.value.trim() })}
          disabled={disabled}
          autoComplete="off"
        />
        <p className="text-ds-muted text-[11px] mt-1.5">
          Your Reamaze login (e.g. <span className="font-mono">brand@subdomain.reamaze.com</span>), not your personal email
        </p>
      </div>
      <div>
        <label className="label">API Token</label>
        <div className="relative">
          <input
            className="input pr-10"
            type={showKey ? 'text' : 'password'}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={value.api_key}
            onChange={e => onChange({ ...value, api_key: e.target.value.trim() })}
            disabled={disabled}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-muted hover:text-ds-text2 transition"
          >
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-ds-muted text-[11px] mt-1.5">
          Found in Reamaze → Settings → API Token
        </p>
      </div>
    </div>
  );
}

// ── Connect modal ────────────────────────────────────────────────────────────

type Provider = keyof typeof PROVIDERS;

function ConnectModal({
  provider,
  existing,
  orgId,
  userId,
  onClose,
  onSaved,
}: {
  provider: Provider;
  existing: Integration | null;
  orgId: string;
  userId: string;
  onClose: () => void;
  onSaved: (integration: Integration) => void;
}) {
  const meta = PROVIDERS[provider];

  const [shopifyCreds, setShopifyCreds] = useState<ShopifyCredentials>(
    provider === 'shopify' && existing
      ? (existing.credentials as ShopifyCredentials)
      : { shop_domain: '', access_token: '' }
  );
  const [reamazeCreds, setReamazeCreds] = useState<ReamazeCredentials>(
    provider === 'reamaze' && existing
      ? (existing.credentials as ReamazeCredentials)
      : { subdomain: '', email: '', api_key: '' }
  );

  const [status, setStatus] = useState<'idle' | 'testing' | 'saving' | 'done'>('idle');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const busy = status === 'testing' || status === 'saving';

  function isValid(): boolean {
    if (provider === 'shopify') {
      return !!shopifyCreds.shop_domain && !!shopifyCreds.access_token;
    }
    return !!reamazeCreds.subdomain && !!reamazeCreds.email && !!reamazeCreds.api_key;
  }

  async function handleSave() {
    if (!isValid()) return;

    setStatus('testing');
    setTestResult(null);

    const creds = provider === 'shopify' ? shopifyCreds : reamazeCreds;
    const result = await testIntegrationCredentials(provider, creds);

    setTestResult(result);

    if (!result.ok) {
      setStatus('idle');
      return;
    }

    setStatus('saving');
    try {
      const saved = await upsertIntegration({
        ...(existing ? { id: existing.id } : {}),
        organization_id: orgId,
        provider,
        category: meta.category,
        auth_type: meta.auth_type,
        credentials: creds,
        created_by: userId,
      });
      setStatus('done');
      onSaved(saved);
    } catch (err: any) {
      setTestResult({ ok: false, message: err?.message ?? 'Failed to save integration.' });
      setStatus('idle');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!busy ? onClose : undefined} />

      <div className="relative w-full max-w-md bg-ds-surface border border-ds-border rounded-2xl shadow-card animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ds-borderSoft">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${meta.gradient} flex items-center justify-center shadow-accent-glow`}>
              <meta.icon size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-ds-text text-sm">
                {existing ? 'Reconfigure' : 'Connect'} {meta.label}
              </h3>
              <p className="text-ds-muted text-[11px] mt-0.5">Enter your credentials below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-lg hover:bg-ds-hover text-ds-muted hover:text-ds-text2 transition disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          {provider === 'shopify' ? (
            <ShopifyForm value={shopifyCreds} onChange={setShopifyCreds} disabled={busy} />
          ) : (
            <ReamazeForm value={reamazeCreds} onChange={setReamazeCreds} disabled={busy} />
          )}

          {/* Test result feedback */}
          {testResult && (
            <div
              className={`mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                testResult.ok
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ds-borderSoft flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="btn-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={busy || !isValid() || status === 'done'}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'testing' && <Loader2 size={14} className="animate-spin" />}
            {status === 'saving' && <Loader2 size={14} className="animate-spin" />}
            {status === 'testing' ? 'Testing…' : status === 'saving' ? 'Saving…' : status === 'done' ? 'Saved!' : 'Test & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Integration card ─────────────────────────────────────────────────────────

function IntegrationCard({
  provider,
  integration,
  onConnect,
  onDelete,
}: {
  provider: Provider;
  integration: Integration | null;
  onConnect: () => void;
  onDelete: (id: string) => void;
}) {
  const meta = PROVIDERS[provider];
  const Icon = meta.icon;
  const connected = !!integration;
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!integration) return;
    setDeleting(true);
    try {
      await deleteIntegration(integration.id);
      onDelete(integration.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="card p-6 flex flex-col gap-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl ${meta.gradient} flex items-center justify-center flex-shrink-0 shadow-accent-glow`}>
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-ds-text text-sm leading-tight">{meta.label}</p>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium mt-1 ${
                connected ? 'text-emerald-400' : 'text-ds-muted'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connected ? 'bg-emerald-400' : 'bg-ds-border'
                }`}
              />
              {connected ? 'Connected' : 'Not connected'}
            </span>
          </div>
        </div>

        {connected && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Disconnect"
            className="p-1.5 rounded-lg text-ds-muted hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-ds-muted text-xs leading-relaxed flex-1">{meta.description}</p>

      {/* Connected details */}
      {connected && provider === 'shopify' && (
        <div className="bg-ds-surface2 rounded-xl px-3.5 py-3 border border-ds-borderSoft text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-ds-muted">Shop</span>
            <span className="text-ds-text2 font-mono truncate max-w-[160px]">
              {(integration.credentials as ShopifyCredentials).shop_domain}
            </span>
          </div>
        </div>
      )}
      {connected && provider === 'reamaze' && (
        <div className="bg-ds-surface2 rounded-xl px-3.5 py-3 border border-ds-borderSoft text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-ds-muted">Subdomain</span>
            <span className="text-ds-text2 font-mono truncate max-w-[160px]">
              {(integration.credentials as ReamazeCredentials).subdomain}.reamaze.com
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ds-muted">Email</span>
            <span className="text-ds-text2 truncate max-w-[160px]">
              {(integration.credentials as ReamazeCredentials).email}
            </span>
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={onConnect}
        className={connected ? 'btn-secondary w-full justify-center' : 'btn-primary w-full justify-center'}
      >
        {connected ? (
          <>
            <RefreshCw size={14} /> Reconfigure
          </>
        ) : (
          <>
            <Plug size={14} /> Connect
          </>
        )}
      </button>
    </div>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────

export default function IntegrationsSection() {
  const { activeOrg, user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalProvider, setModalProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    getIntegrations(activeOrg.id)
      .then(setIntegrations)
      .catch(err => setError(err?.message ?? 'Failed to load integrations.'))
      .finally(() => setLoading(false));
  }, [activeOrg?.id]);

  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-4">
          <Plug size={24} className="text-ds-muted" />
        </div>
        <p className="text-ds-text2 text-sm font-medium">No organization found</p>
        <p className="text-ds-muted text-xs mt-1">Select an organization to manage integrations.</p>
      </div>
    );
  }

  function getIntegration(provider: Provider): Integration | null {
    return integrations.find(i => i.provider === provider) ?? null;
  }

  function handleSaved(saved: Integration) {
    setIntegrations(prev => {
      const idx = prev.findIndex(i => i.id === saved.id || i.provider === saved.provider);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setModalProvider(null);
  }

  function handleDeleted(id: string) {
    setIntegrations(prev => prev.filter(i => i.id !== id));
  }

  const connectedCount = (Object.keys(PROVIDERS) as Provider[]).filter(
    p => !!getIntegration(p)
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ds-text">Integrations</h1>
          <p className="text-ds-muted text-sm mt-1">
            Connect your external platforms to power your n8n automations.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-ds-surface2 border border-ds-borderSoft rounded-xl">
          <span className="w-2 h-2 rounded-full bg-ds-accent" />
          <span className="text-ds-text2 text-xs font-medium">
            {connectedCount} / {Object.keys(PROVIDERS).length} connected
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-2 text-ds-muted">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading integrations…</span>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(PROVIDERS) as Provider[]).map(provider => (
            <IntegrationCard
              key={provider}
              provider={provider}
              integration={getIntegration(provider)}
              onConnect={() => setModalProvider(provider)}
              onDelete={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalProvider && (
        <ConnectModal
          provider={modalProvider}
          existing={getIntegration(modalProvider)}
          orgId={activeOrg.id}
          userId={user!.id}
          onClose={() => setModalProvider(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
