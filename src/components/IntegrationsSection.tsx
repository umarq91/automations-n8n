import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plug, CheckCircle2, AlertCircle, Loader2, X,
  Trash2, RefreshCw, Eye, EyeOff, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getIntegrations,
  upsertIntegration,
  deleteIntegration,
  initiateShopifyOAuth,
  testIntegrationCredentials,
  type TestResult,
  type OAuthInitResult,
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
    description: 'Connect your Shopify store to sync orders, products, and customers via OAuth.',
    logo: '/shopify.png',
    logoSize: 'w-11 h-11',
    gradient: 'gradient-emerald',
    category: 'ecommerce',
    auth_type: 'oauth2',
    comingSoon: false,
  },
  reamaze: {
    label: 'Reamaze',
    description: 'Connect Reamaze to manage customer support conversations.',
    logo: '/reamaze.png',
    logoSize: 'w-8 h-8',
    gradient: 'gradient-violet',
    category: 'support',
    auth_type: 'basic',
    comingSoon: false,
  },
  monday: {
    label: 'Monday.com',
    description: 'Sync tasks, boards, and project data with your Monday.com workspace.',
    logo: '/monday.png',
    logoSize: 'w-8 h-8',
    gradient: 'gradient-rose',
    category: 'project-management',
    auth_type: 'oauth2',
    comingSoon: true,
  },
} as const;

type Provider = keyof typeof PROVIDERS;

// ── Shopify OAuth form ───────────────────────────────────────────────────────

function ShopifyForm({
  value,
  onChange,
  disabled,
}: {
  value: ShopifyCredentials;
  onChange: (v: ShopifyCredentials) => void;
  disabled: boolean;
}) {
  const [showSecret, setShowSecret] = useState(false);
  return (
    <div className="space-y-4">
      <div className="px-3.5 py-3 bg-ds-surface2 border border-ds-borderSoft rounded-xl text-xs text-ds-muted leading-relaxed">
        Enter your Shopify Partner App credentials. You'll be redirected to Shopify to authorize access.
      </div>
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
        <p className="text-ds-muted text-[11px] mt-1.5">Your store's .myshopify.com URL</p>
      </div>
      <div>
        <label className="label">Client ID</label>
        <input
          className="input"
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={value.client_id}
          onChange={e => onChange({ ...value, client_id: e.target.value.trim() })}
          disabled={disabled}
          autoComplete="off"
        />
        <p className="text-ds-muted text-[11px] mt-1.5">
          Found in your Shopify Partner App → App setup → Client ID
        </p>
      </div>
      <div>
        <label className="label">Client Secret</label>
        <div className="relative">
          <input
            className="input pr-10"
            type={showSecret ? 'text' : 'password'}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={value.client_secret}
            onChange={e => onChange({ ...value, client_secret: e.target.value.trim() })}
            disabled={disabled}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowSecret(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-muted hover:text-ds-text2 transition"
          >
            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-ds-muted text-[11px] mt-1.5">
          Found in your Shopify Partner App → App setup → Client secret
        </p>
      </div>
    </div>
  );
}

// ── Reamaze form ─────────────────────────────────────────────────────────────

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
      : { shop_domain: '', client_id: '', client_secret: '' }
  );
  const [reamazeCreds, setReamazeCreds] = useState<ReamazeCredentials>(
    provider === 'reamaze' && existing
      ? (existing.credentials as ReamazeCredentials)
      : { subdomain: '', email: '', api_key: '' }
  );

  const [status, setStatus] = useState<'idle' | 'working' | 'done'>('idle');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const busy = status === 'working';

  function isValid(): boolean {
    if (provider === 'shopify') {
      return !!shopifyCreds.shop_domain && !!shopifyCreds.client_id && !!shopifyCreds.client_secret;
    }
    return !!reamazeCreds.subdomain && !!reamazeCreds.email && !!reamazeCreds.api_key;
  }

  async function handleShopify() {
    setStatus('working');
    setResult(null);
    const res: OAuthInitResult = await initiateShopifyOAuth({
      org_id: orgId,
      user_id: userId,
      shop_domain: shopifyCreds.shop_domain,
      client_id: shopifyCreds.client_id,
      client_secret: shopifyCreds.client_secret,
    });
    if (!res.ok) {
      setResult({ ok: false, message: res.message });
      setStatus('idle');
      return;
    }
    // Redirect to Shopify OAuth — page will return via callback
    window.location.href = res.url;
  }

  async function handleReamaze() {
    setStatus('working');
    setResult(null);
    const testRes: TestResult = await testIntegrationCredentials('reamaze', reamazeCreds);
    setResult(testRes);
    if (!testRes.ok) {
      setStatus('idle');
      return;
    }
    try {
      const saved = await upsertIntegration({
        ...(existing ? { id: existing.id } : {}),
        organization_id: orgId,
        provider: 'reamaze',
        category: meta.category,
        auth_type: meta.auth_type,
        credentials: reamazeCreds,
        created_by: userId,
      });
      setStatus('done');
      onSaved(saved);
    } catch (err: any) {
      setResult({ ok: false, message: err?.message ?? 'Failed to save integration.' });
      setStatus('idle');
    }
  }

  function handleSubmit() {
    if (provider === 'shopify') handleShopify();
    else handleReamaze();
  }

  const buttonLabel = () => {
    if (busy) return provider === 'shopify' ? 'Redirecting…' : 'Connecting…';
    if (status === 'done') return 'Connected!';
    if (provider === 'shopify') return 'Connect with Shopify';
    return 'Test & Connect';
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!busy ? onClose : undefined} />

      {/* pt-16 clears the sticky header; min-h-full + flex keeps it centered when short */}
      <div className="relative min-h-full flex items-center justify-center p-4 pt-16 pb-8">
      <div className="w-full max-w-md bg-ds-surface border border-ds-border rounded-2xl shadow-card animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ds-borderSoft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ds-surface2 border border-ds-borderSoft flex items-center justify-center">
              <img src={meta.logo} alt={meta.label} className={`${meta.logoSize} object-contain scale-75`} />
            </div>
            <div>
              <h3 className="font-semibold text-ds-text text-sm">
                {existing ? 'Reconfigure' : 'Connect'} {meta.label}
              </h3>
              <p className="text-ds-muted text-[11px] mt-0.5">
                {provider === 'shopify' ? 'OAuth 2.0 — you\'ll be redirected to authorize' : 'Enter your credentials below'}
              </p>
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

          {result && (
            <div
              className={`mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                result.ok
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {result.ok
                ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                : <AlertCircle size={15} className="shrink-0 mt-0.5" />
              }
              <span className="leading-snug">{result.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ds-borderSoft flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={busy} className="btn-secondary disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !isValid() || status === 'done'}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {provider === 'shopify' && !busy && <ExternalLink size={14} />}
            {buttonLabel()}
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body
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
  const comingSoon = meta.comingSoon;
  const connected = !comingSoon && !!integration?.is_active;
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
    <div className={`card p-6 flex flex-col gap-5 relative ${comingSoon ? 'opacity-60' : ''}`}>
      {comingSoon && (
        <div className="absolute top-4 right-4">
          <span className="badge bg-ds-hover text-ds-muted border border-ds-border text-[10px] uppercase tracking-widest">
            Coming Soon
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-ds-surface2 border border-ds-borderSoft flex items-center justify-center flex-shrink-0">
            <img src={meta.logo} alt={meta.label} className={`${meta.logoSize} object-contain`} />
          </div>
          <div>
            <p className="font-semibold text-ds-text text-sm leading-tight">{meta.label}</p>
            {!comingSoon && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium mt-1 ${connected ? 'text-emerald-400' : 'text-ds-muted'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-ds-border'}`} />
                {connected ? 'Connected' : 'Not connected'}
              </span>
            )}
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

      <p className="text-ds-muted text-xs leading-relaxed flex-1">{meta.description}</p>

      {connected && provider === 'shopify' && (
        <div className="bg-ds-surface2 rounded-xl px-3.5 py-3 border border-ds-borderSoft text-xs space-y-1.5">
          <div className="flex justify-between gap-2">
            <span className="text-ds-muted shrink-0">Store URL</span>
            <span className="text-ds-text2 font-mono truncate">
              {(integration.metadata as Record<string, string>)?.store_url
                ?? (integration.credentials as ShopifyCredentials).shop_domain}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-ds-muted shrink-0">Admin URL</span>
            <span className="text-ds-text2 font-mono truncate">
              {(integration.metadata as Record<string, string>)?.admin_url ?? '—'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-ds-muted shrink-0">Scopes</span>
            <span className="text-emerald-400 font-medium">Authorized</span>
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

      <button
        onClick={!comingSoon ? onConnect : undefined}
        disabled={comingSoon}
        className={`w-full justify-center disabled:cursor-not-allowed ${
          comingSoon ? 'btn-secondary opacity-50' : connected ? 'btn-secondary' : 'btn-primary'
        }`}
      >
        {comingSoon
          ? 'Coming Soon'
          : connected
          ? <><RefreshCw size={14} /> Reconfigure</>
          : <><Plug size={14} /> Connect</>
        }
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
  const [oauthBanner, setOauthBanner] = useState<'success' | 'error' | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Detect return from Shopify OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify_connected') === '1') {
      setOauthBanner('success');
      const url = new URL(window.location.href);
      url.searchParams.delete('shopify_connected');
      window.history.replaceState({}, '', url.toString());
    } else if (params.get('shopify_error')) {
      setOauthError(decodeURIComponent(params.get('shopify_error')!));
      setOauthBanner('error');
      const url = new URL(window.location.href);
      url.searchParams.delete('shopify_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

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

  const activeProviders = (Object.keys(PROVIDERS) as Provider[]).filter(p => !PROVIDERS[p].comingSoon);
  const connectedCount = activeProviders.filter(p => !!getIntegration(p)?.is_active).length;

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
            {connectedCount} / {activeProviders.length} connected
          </span>
        </div>
      </div>

      {/* OAuth return banners */}
      {oauthBanner === 'success' && (
        <div className="flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className="shrink-0" />
            Shopify connected successfully! Your store is now authorized.
          </div>
          <button onClick={() => setOauthBanner(null)} className="text-emerald-400/60 hover:text-emerald-400 transition">
            <X size={14} />
          </button>
        </div>
      )}
      {oauthBanner === 'error' && (
        <div className="flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={15} className="shrink-0" />
            {oauthError ?? 'Shopify connection failed. Please try again.'}
          </div>
          <button onClick={() => setOauthBanner(null)} className="text-red-400/60 hover:text-red-400 transition">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Load error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24 gap-2 text-ds-muted">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading integrations…</span>
        </div>
      )}

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
