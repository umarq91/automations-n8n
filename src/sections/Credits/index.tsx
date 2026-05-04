import { useEffect, useState } from 'react';
import { CreditCard, Layers, MessageCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CreditModel } from '../../models/CreditModel';
import type { OrganizationCredits, CreditUsageLogWithProduct, CreditType } from '../../lib/supabase/types';
import { formatDate, formatDateTime } from '../../lib/utils';
import { Skeleton } from '../../components/ui/skeleton';
import { Pagination } from '../../components/ui/pagination';
import { PAGE_SIZE } from '../../constants/pagination';

const CREDIT_META: Record<CreditType, { label: string; icon: typeof Layers; gradient: string; iconColor: string }> = {
  listing:      { label: 'Listing Credits',      icon: Layers,        gradient: 'gradient-indigo',  iconColor: 'text-ds-accent'   },
  support:      { label: 'Support Credits',       icon: MessageCircle, gradient: 'gradient-emerald', iconColor: 'text-emerald-400' },
  optimization: { label: 'Optimization Credits',  icon: Sparkles,      gradient: 'gradient-violet',  iconColor: 'text-violet-400'  },
};

function usageColor(pct: number) {
  if (pct >= 80) return { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
  if (pct >= 50) return { bar: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
}

function CreditStatCard({ type, used, total }: { type: CreditType; used: number; total: number }) {
  const meta = CREDIT_META[type];
  const Icon = meta.icon;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const remaining = total - used;
  const color = usageColor(pct);

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${meta.gradient} flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className="text-white" />
        </div>
        <div>
          <p className="text-ds-text text-sm font-semibold">{meta.label}</p>
          <p className="text-ds-muted text-xs">Current period</p>
        </div>
        <div className={`ml-auto px-2.5 py-1 rounded-lg ${color.bg} text-xs font-semibold ${color.text}`}>
          {pct}%
        </div>
      </div>
      <div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-bold text-ds-text">{remaining.toLocaleString()}</span>
          <span className="text-ds-muted text-xs">of {total.toLocaleString()} remaining</span>
        </div>
        <div className="w-full h-1.5 bg-ds-surface2 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${color.bar}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-ds-muted text-xs mt-1.5">{used.toLocaleString()} used</p>
      </div>
    </div>
  );
}

export default function CreditsSection() {
  const { activeOrg } = useAuth();
  const [credits,     setCredits]     = useState<OrganizationCredits | null>(null);
  const [logs,        setLogs]        = useState<CreditUsageLogWithProduct[]>([]);
  const [logsTotal,   setLogsTotal]   = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const [page, setPage] = useState<number>(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get('credits_page') ?? '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const totalPages = Math.max(1, Math.ceil(logsTotal / PAGE_SIZE));

  async function loadCredits() {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    const c = await CreditModel.get(activeOrg.id);
    if (!c) {
      setError('No credit record found for this organization.');
      setLoading(false);
      return;
    }
    setCredits(c);
    setLoading(false);
    await fetchLogs(page, c.period_start);
  }

  async function fetchLogs(targetPage = page, since?: string) {
    if (!activeOrg) return;
    setLogsLoading(true);
    const { data, total } = await CreditModel.getLogsPage(
      activeOrg.id, targetPage, PAGE_SIZE, since
    );
    setLogs(data);
    setLogsTotal(total);
    setLogsLoading(false);
  }

  function goToPage(p: number) {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setPage(clamped);
    const params = new URLSearchParams(window.location.search);
    params.set('credits_page', String(clamped));
    window.history.replaceState(null, '', `?${params.toString()}`);
    fetchLogs(clamped, credits?.period_start);
  }

  useEffect(() => { loadCredits(); }, [activeOrg?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      const params = new URLSearchParams(window.location.search);
      params.delete('credits_page');
      const next = params.toString();
      window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname);
    };
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
            <CreditCard size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-ds-text text-xl font-bold">Credits</h1>
            <p className="text-ds-muted text-sm">
              {credits
                ? `Period: ${formatDate(credits.period_start)} — ${formatDate(credits.period_end)}`
                : 'Current billing period usage'}
            </p>
          </div>
        </div>
        <button onClick={loadCredits} className="btn-ghost flex items-center gap-2 text-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-28 mb-1.5" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-ds-borderSoft">
              <Skeleton className="h-4 w-24 mb-1.5" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="divide-y divide-ds-borderSoft">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <Skeleton className="w-7 h-7 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3.5 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-3.5 w-10 mb-1.5 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {error && !loading && (
        <div className="card p-6 text-center">
          <p className="text-ds-text2 text-sm">{error}</p>
          <p className="text-ds-muted text-xs mt-1">Credits will appear here once the organization is set up with a credit allocation.</p>
        </div>
      )}

      {credits && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <CreditStatCard type="listing"      used={credits.listing_credits_used}      total={credits.listing_credits_total} />
            <CreditStatCard type="support"      used={credits.support_credits_used}      total={credits.support_credits_total} />
            <CreditStatCard type="optimization" used={credits.optimization_credits_used} total={credits.optimization_credits_total} />
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-ds-borderSoft flex items-center justify-between">
              <div>
                <h2 className="text-ds-text text-sm font-semibold">Usage Log</h2>
                <p className="text-ds-muted text-xs mt-0.5">
                  {logsTotal > 0 ? `${logsTotal} deduction${logsTotal !== 1 ? 's' : ''} this period` : 'All deductions in the current period'}
                </p>
              </div>
            </div>

            {logsLoading ? (
              <div className="divide-y divide-ds-borderSoft">
                {Array.from({ length: logs.length || PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-4">
                    <Skeleton className="w-7 h-7 shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-3.5 w-32 mb-1.5" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-3.5 w-10 mb-1.5 ml-auto" />
                      <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-ds-muted text-sm">No usage recorded yet this period.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-ds-borderSoft">
                  {logs.map((log) => {
                    const meta = CREDIT_META[log.credit_type];
                    const Icon = meta.icon;
                    const productTitle = log.product?.title ?? null;
                    const adminUrl = log.product?.shopify_admin_url ?? log.product_admin_url ?? null;
                    return (
                      <div key={log.id} className="px-5 py-3 flex items-center gap-4 hover:bg-ds-hover transition-colors">
                        <div className={`w-7 h-7 rounded-lg ${meta.gradient} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={12} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ds-text text-sm font-medium">{meta.label}</p>
                          {productTitle && <p className="text-ds-text2 text-xs truncate font-medium">{productTitle}</p>}
                          {log.note && <p className="text-ds-muted text-xs truncate">{log.note}</p>}
                          {adminUrl ? (
                            <a href={adminUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-ds-accent hover:text-ds-accentHover truncate block transition-colors">
                              View in Shopify Admin ↗
                            </a>
                          ) : (
                            <p className="text-ds-muted text-xs italic">No admin URL</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-red-400 text-sm font-semibold">−{log.amount}</p>
                          <p className="text-ds-muted text-xs">{formatDateTime(log.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="px-5 py-4 border-t border-ds-borderSoft flex flex-col items-center gap-2">
                    <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
                    <p className="text-ds-muted text-[11px]">
                      Page {page} of {totalPages} · {logsTotal} total
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
