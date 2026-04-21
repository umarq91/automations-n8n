import { useState } from 'react';
import { Plug, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { IntegrationModel } from '../../../models/IntegrationModel';
import type { Integration, ShopifyCredentials, ReamazeCredentials } from '../../../lib/supabase/types';
import { PROVIDERS, type Provider } from '../integrationMeta';

interface IntegrationCardProps {
  provider: Provider;
  integration: Integration | null;
  onConnect: () => void;
  onDelete: (id: string) => void;
}

export default function IntegrationCard({ provider, integration, onConnect, onDelete }: IntegrationCardProps) {
  const meta = PROVIDERS[provider];
  const comingSoon = meta.comingSoon;
  const connected = !comingSoon && !!integration?.is_active;
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!integration) return;
    setDeleting(true);
    try {
      await IntegrationModel.delete(integration.id);
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
          <button onClick={handleDelete} disabled={deleting} title="Disconnect"
            className="p-1.5 rounded-lg text-ds-muted hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40">
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
            <span className="text-ds-text2 font-mono truncate">{(integration.metadata as Record<string, string>)?.admin_url ?? '—'}</span>
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
            <span className="text-ds-text2 truncate max-w-[160px]">{(integration.credentials as ReamazeCredentials).email}</span>
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
        {comingSoon ? 'Coming Soon' : connected ? <><RefreshCw size={14} /> Reconfigure</> : <><Plug size={14} /> Connect</>}
      </button>
    </div>
  );
}
