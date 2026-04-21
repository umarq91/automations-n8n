import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Loader2, X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { IntegrationModel } from '../../../models/IntegrationModel';
import type { OAuthInitResult, TestResult } from '../../../models/IntegrationModel';
import type { Integration, ShopifyCredentials, ReamazeCredentials } from '../../../lib/supabase/types';
import { PROVIDERS, type Provider } from '../integrationMeta';

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
        <input className="input" placeholder="mystore.myshopify.com" value={value.shop_domain}
          onChange={e => onChange({ ...value, shop_domain: e.target.value.trim() })} disabled={disabled} autoComplete="off" />
        <p className="text-ds-muted text-[11px] mt-1.5">Your store's .myshopify.com URL</p>
      </div>
      <div>
        <label className="label">Client ID</label>
        <input className="input" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" value={value.client_id}
          onChange={e => onChange({ ...value, client_id: e.target.value.trim() })} disabled={disabled} autoComplete="off" />
        <p className="text-ds-muted text-[11px] mt-1.5">Found in your Shopify Partner App → App setup → Client ID</p>
      </div>
      <div>
        <label className="label">Client Secret</label>
        <div className="relative">
          <input className="input pr-10" type={showSecret ? 'text' : 'password'} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={value.client_secret} onChange={e => onChange({ ...value, client_secret: e.target.value.trim() })}
            disabled={disabled} autoComplete="new-password" />
          <button type="button" onClick={() => setShowSecret(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-muted hover:text-ds-text2 transition">
            {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-ds-muted text-[11px] mt-1.5">Found in your Shopify Partner App → App setup → Client secret</p>
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
          <span className="px-3 py-2.5 bg-ds-hover border border-ds-border border-r-0 rounded-l-xl text-ds-muted text-sm select-none">https://</span>
          <input
            className="flex-1 px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-none text-sm text-ds-text placeholder-ds-muted focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/60 transition-all"
            placeholder="mystore" value={value.subdomain}
            onChange={e => onChange({ ...value, subdomain: e.target.value.trim() })} disabled={disabled} autoComplete="off" />
          <span className="px-3 py-2.5 bg-ds-hover border border-ds-border border-l-0 rounded-r-xl text-ds-muted text-sm select-none">.reamaze.com</span>
        </div>
        <p className="text-ds-muted text-[11px] mt-1.5">Your Reamaze account subdomain</p>
      </div>
      <div>
        <label className="label">Login Email</label>
        <input className="input" type="text" placeholder="support@automations.reamaze.com" value={value.email}
          onChange={e => onChange({ ...value, email: e.target.value.trim() })} disabled={disabled} autoComplete="off" />
        <p className="text-ds-muted text-[11px] mt-1.5">
          Your Reamaze login (e.g. <span className="font-mono">brand@subdomain.reamaze.com</span>), not your personal email
        </p>
      </div>
      <div>
        <label className="label">API Token</label>
        <div className="relative">
          <input className="input pr-10" type={showKey ? 'text' : 'password'} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={value.api_key} onChange={e => onChange({ ...value, api_key: e.target.value.trim() })}
            disabled={disabled} autoComplete="new-password" />
          <button type="button" onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-muted hover:text-ds-text2 transition">
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-ds-muted text-[11px] mt-1.5">Found in Reamaze → Settings → API Token</p>
      </div>
    </div>
  );
}

interface ConnectModalProps {
  provider: Provider;
  existing: Integration | null;
  orgId: string;
  userId: string;
  onClose: () => void;
  onSaved: (integration: Integration) => void;
}

export default function ConnectModal({ provider, existing, orgId, userId, onClose, onSaved }: ConnectModalProps) {
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
    if (provider === 'shopify') return !!shopifyCreds.shop_domain && !!shopifyCreds.client_id && !!shopifyCreds.client_secret;
    return !!reamazeCreds.subdomain && !!reamazeCreds.email && !!reamazeCreds.api_key;
  }

  async function handleShopify() {
    setStatus('working');
    setResult(null);
    const res: OAuthInitResult = await IntegrationModel.initiateShopifyOAuth({
      org_id: orgId, user_id: userId,
      shop_domain: shopifyCreds.shop_domain,
      client_id: shopifyCreds.client_id,
      client_secret: shopifyCreds.client_secret,
    });
    if (!res.ok) { setResult({ ok: false, message: res.message }); setStatus('idle'); return; }
    window.location.href = res.url;
  }

  async function handleReamaze() {
    setStatus('working');
    setResult(null);
    const testRes: TestResult = await IntegrationModel.testCredentials('reamaze', reamazeCreds);
    setResult(testRes);
    if (!testRes.ok) { setStatus('idle'); return; }
    try {
      const saved = await IntegrationModel.upsert({
        ...(existing ? { id: existing.id } : {}),
        organization_id: orgId, provider: 'reamaze',
        category: meta.category, auth_type: meta.auth_type,
        credentials: reamazeCreds, created_by: userId,
      });
      setStatus('done');
      onSaved(saved);
    } catch (err: unknown) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Failed to save integration.' });
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
      <div className="relative min-h-full flex items-center justify-center p-4 pt-16 pb-8">
        <div className="w-full max-w-md bg-ds-surface border border-ds-border rounded-2xl shadow-card animate-fade-in">
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
                  {provider === 'shopify' ? "OAuth 2.0 — you'll be redirected to authorize" : 'Enter your credentials below'}
                </p>
              </div>
            </div>
            <button onClick={onClose} disabled={busy}
              className="p-1.5 rounded-lg hover:bg-ds-hover text-ds-muted hover:text-ds-text2 transition disabled:opacity-40">
              <X size={15} />
            </button>
          </div>

          <div className="px-6 py-5">
            {provider === 'shopify'
              ? <ShopifyForm value={shopifyCreds} onChange={setShopifyCreds} disabled={busy} />
              : <ReamazeForm value={reamazeCreds} onChange={setReamazeCreds} disabled={busy} />
            }
            {result && (
              <div className={`mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                result.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {result.ok ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <AlertCircle size={15} className="shrink-0 mt-0.5" />}
                <span className="leading-snug">{result.message}</span>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-ds-borderSoft flex items-center justify-end gap-3">
            <button onClick={onClose} disabled={busy} className="btn-secondary disabled:opacity-50">Cancel</button>
            <button onClick={handleSubmit} disabled={busy || !isValid() || status === 'done'}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
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
