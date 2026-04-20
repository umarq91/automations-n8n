import { useEffect, useState } from 'react';
import { CreditCard, Layers, MessageCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getOrganizationCredits, getCreditUsageLogs } from '../lib/supabase/credits';
import type { OrganizationCredits, CreditUsageLog, CreditType } from '../lib/supabase/types';

const CREDIT_META: Record<CreditType, { label: string; icon: typeof Layers; gradient: string; iconColor: string }> = {
  listing:      { label: 'Listing Credits',      icon: Layers,          gradient: 'gradient-indigo',  iconColor: 'text-ds-accent'   },
  support:      { label: 'Support Credits',       icon: MessageCircle,   gradient: 'gradient-emerald', iconColor: 'text-emerald-400' },
  optimization: { label: 'Optimization Credits',  icon: Sparkles,        gradient: 'gradient-violet',  iconColor: 'text-violet-400'  },
};

function usageColor(pct: number) {
  if (pct >= 80) return { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
  if (pct >= 50) return { bar: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface CreditCardProps {
  type: CreditType;
  used: number;
  total: number;
}

function CreditStatCard({ type, used, total }: CreditCardProps) {
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
          <div
            className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-ds-muted text-xs mt-1.5">{used.toLocaleString()} used</p>
      </div>
    </div>
  );
}

export default function CreditsSection() {
  const { activeOrg } = useAuth();
  const [credits, setCredits] = useState<OrganizationCredits | null>(null);
  const [logs, setLogs] = useState<CreditUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    const c = await getOrganizationCredits(activeOrg.id);
    if (!c) {
      setError('No credit record found for this organization.');
      setLoading(false);
      return;
    }
    const l = await getCreditUsageLogs(activeOrg.id, c.period_start);
    setCredits(c);
    setLogs(l);
    setLoading(false);
  }

  useEffect(() => { load(); }, [activeOrg?.id]);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
        <button
          onClick={load}
          className="btn-ghost flex items-center gap-2 text-sm"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <RefreshCw size={20} className="animate-spin text-ds-muted" />
        </div>
      )}

      {error && !loading && (
        <div className="card p-6 text-center">
          <p className="text-ds-text2 text-sm">{error}</p>
          <p className="text-ds-muted text-xs mt-1">Credits will appear here once the organization is set up with a credit allocation.</p>
        </div>
      )}

      {credits && !loading && (
        <>
          {/* Credit cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <CreditStatCard type="listing"      used={credits.listing_credits_used}      total={credits.listing_credits_total} />
            <CreditStatCard type="support"      used={credits.support_credits_used}      total={credits.support_credits_total} />
            <CreditStatCard type="optimization" used={credits.optimization_credits_used} total={credits.optimization_credits_total} />
          </div>

          {/* Usage log */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-ds-borderSoft">
              <h2 className="text-ds-text text-sm font-semibold">Usage Log</h2>
              <p className="text-ds-muted text-xs mt-0.5">All deductions in the current period</p>
            </div>
            {logs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-ds-muted text-sm">No usage recorded yet this period.</p>
              </div>
            ) : (
              <div className="divide-y divide-ds-borderSoft">
                {logs.map((log) => {
                  const meta = CREDIT_META[log.credit_type];
                  const Icon = meta.icon;
                  return (
                    <div key={log.id} className="px-5 py-3 flex items-center gap-4 hover:bg-ds-hover transition-colors">
                      <div className={`w-7 h-7 rounded-lg ${meta.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={12} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ds-text text-sm font-medium">{meta.label}</p>
                        {log.reference_id && (
                          <p className="text-ds-muted text-xs truncate">ref: {log.reference_id}</p>
                        )}
                        {log.note && (
                          <p className="text-ds-muted text-xs truncate">{log.note}</p>
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
