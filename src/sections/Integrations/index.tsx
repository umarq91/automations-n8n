import { useEffect, useState } from 'react';
import { Plug, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import EmptyState from '../../components/shared/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { IntegrationModel } from '../../models/IntegrationModel';
import type { Integration } from '../../lib/supabase/types';
import { PROVIDERS, type Provider } from './integrationMeta';
import IntegrationCard from './components/IntegrationCard';
import ConnectModal from './components/ConnectModal';

export default function IntegrationsSection() {
  const { activeOrg, user } = useAuth();
  const [integrations,  setIntegrations]  = useState<Integration[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [modalProvider, setModalProvider] = useState<Provider | null>(null);
  const [oauthBanner,   setOauthBanner]   = useState<'success' | 'error' | null>(null);
  const [oauthError,    setOauthError]    = useState<string | null>(null);

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
    IntegrationModel.getAll(activeOrg.id)
      .then(setIntegrations)
      .catch(err => setError(err?.message ?? 'Failed to load integrations.'))
      .finally(() => setLoading(false));
  }, [activeOrg?.id]);

  if (!activeOrg) {
    return <EmptyState icon={<Plug size={24} className="text-ds-muted" />} title="No organization found" description="Select an organization to manage integrations." />;
  }

  function getIntegration(provider: Provider): Integration | null {
    return integrations.find(i => i.provider === provider) ?? null;
  }

  function handleSaved(saved: Integration) {
    setIntegrations(prev => {
      const idx = prev.findIndex(i => i.id === saved.id || i.provider === saved.provider);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [...prev, saved];
    });
    setModalProvider(null);
  }

  function handleDeleted(id: string) {
    setIntegrations(prev => prev.filter(i => i.id !== id));
  }

  const activeProviders = (Object.keys(PROVIDERS) as Provider[]).filter(p => !PROVIDERS[p].comingSoon);
  const connectedCount  = activeProviders.filter(p => !!getIntegration(p)?.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ds-text">Integrations</h1>
          <p className="text-ds-muted text-sm mt-1">Connect your external platforms to power your n8n automations.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-ds-surface2 border border-ds-borderSoft rounded-xl">
          <span className="w-2 h-2 rounded-full bg-ds-accent" />
          <span className="text-ds-text2 text-xs font-medium">{connectedCount} / {activeProviders.length} connected</span>
        </div>
      </div>

      {oauthBanner === 'success' && (
        <div className="flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={15} className="shrink-0" />
            Shopify connected successfully! Your store is now authorized.
          </div>
          <button onClick={() => setOauthBanner(null)} className="text-emerald-400/60 hover:text-emerald-400 transition"><X size={14} /></button>
        </div>
      )}
      {oauthBanner === 'error' && (
        <div className="flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={15} className="shrink-0" />
            {oauthError ?? 'Shopify connection failed. Please try again.'}
          </div>
          <button onClick={() => setOauthBanner(null)} className="text-red-400/60 hover:text-red-400 transition"><X size={14} /></button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
          <AlertCircle size={15} className="shrink-0" />{error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 flex flex-col gap-5">
              <div className="flex items-start gap-3.5">
                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1.5" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
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
