import { useEffect, useState } from 'react';
import {
  Activity, CheckCircle2, XCircle, ExternalLink,
  Package, Clock, Cpu, Link2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WorkflowLogModel } from '../../models/WorkflowLogModel';
import type { WorkflowLog } from '../../lib/supabase/types';
import { formatRelative } from '../../lib/utils';
import { Skeleton } from '../../components/ui/skeleton';
import { Pagination } from '../../components/ui/pagination';
import { PAGE_SIZE } from '../../constants/pagination';

type FilterType = 'all' | 'success' | 'error';

function LogCard({ log }: { log: WorkflowLog }) {
  const isSuccess = log.type === 'success';
  const isError   = log.type === 'error';

  return (
    <div className="card overflow-hidden">
      <div className="flex gap-0">
        <div className={`w-1 shrink-0 ${isSuccess ? 'bg-emerald-500/70' : isError ? 'bg-red-500/70' : 'bg-ds-border'}`} />
        <div className="flex-1 px-5 py-4 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isSuccess ? 'bg-emerald-500/10' : isError ? 'bg-red-500/10' : 'bg-ds-surface2'
              }`}>
                {isSuccess && <CheckCircle2 size={13} className="text-emerald-400" />}
                {isError   && <XCircle      size={13} className="text-red-400" />}
                {!isSuccess && !isError && <Activity size={13} className="text-ds-muted" />}
              </div>
              <div className="min-w-0">
                <p className={`font-semibold text-sm truncate leading-tight ${isError ? 'text-red-300' : 'text-ds-text'}`}>
                  {log.message ?? 'No message'}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-ds-muted mt-0.5">
                  <Clock size={9} />
                  {formatRelative(log.created_at) ?? new Date(log.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium shrink-0 ${
              isSuccess ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
              isError   ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                          'text-ds-muted bg-ds-surface2 border-ds-border'
            }`}>
              {isSuccess ? 'Success' : isError ? 'Error' : log.type ?? 'Unknown'}
            </span>
          </div>

          {/* Flow name */}
          {log.workflow_name && (
            <p className="text-xs text-ds-muted mb-3">
              <span className="font-medium text-ds-text2">FLOW:</span> {log.workflow_name}
            </p>
          )}

          {/* Product + links row */}
          {(log.product_title || log.product_link || log.execution_url) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {log.product_title && (
                log.product_link ? (
                  <a
                    href={log.product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-ds-accent hover:text-ds-accentHover bg-ds-accent/5 border border-ds-accent/20 hover:border-ds-accent/40 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Package size={10} />
                    {log.product_title}
                    <Link2 size={9} className="opacity-60" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2.5 py-1 rounded-lg">
                    <Package size={10} className="text-ds-muted" />
                    {log.product_title}
                  </span>
                )
              )}
              {log.execution_url && (
                <a
                  href={log.execution_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-ds-muted hover:text-ds-text2 bg-ds-surface2 border border-ds-borderSoft hover:border-ds-border px-2.5 py-1 rounded-lg transition-colors"
                >
                  <ExternalLink size={9} />
                  View execution
                </a>
              )}
            </div>
          )}

          {/* Error detail + meta */}
          {(log.error_description || log.last_node_executed || log.execution_id) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2.5 border-t border-ds-borderSoft">
              {log.error_description && log.error_description !== log.message && (
                <p className="text-[11px] text-red-400/70 leading-relaxed w-full">{log.error_description}</p>
              )}
              {log.last_node_executed && (
                <span className="text-[11px] text-ds-muted">
                  Last node: <span className="font-mono text-ds-text2">{log.last_node_executed}</span>
                </span>
              )}
              {log.execution_id && (
                <span className="flex items-center gap-1 text-[11px] text-ds-muted">
                  <Cpu size={9} />
                  <code className="font-mono">{log.execution_id}</code>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LogsSection() {
  const { activeOrg } = useAuth();
  const [logs,    setLogs]    = useState<WorkflowLog[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<FilterType>('all');

  const [page, setPage] = useState<number>(() => {
    const p = parseInt(new URLSearchParams(window.location.search).get('logs_page') ?? '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function fetchLogs(targetPage = page, currentFilter = filter) {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    try {
      const { data, total: t } = await WorkflowLogModel.getPage(
        activeOrg.id, targetPage, PAGE_SIZE, currentFilter
      );
      setLogs(data);
      setTotal(t);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function goToPage(p: number) {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setPage(clamped);
    const params = new URLSearchParams(window.location.search);
    params.set('logs_page', String(clamped));
    window.history.replaceState(null, '', `?${params.toString()}`);
  }

  function changeFilter(f: FilterType) {
    setFilter(f);
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    params.set('logs_page', '1');
    window.history.replaceState(null, '', `?${params.toString()}`);
    fetchLogs(1, f);
  }

  useEffect(() => { fetchLogs(page, filter); }, [activeOrg, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      const params = new URLSearchParams(window.location.search);
      params.delete('logs_page');
      const next = params.toString();
      window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname);
    };
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-ds-text font-bold text-xl tracking-tight">Logs & Monitoring</h1>
          <p className="text-ds-muted text-sm mt-0.5">
            {loading ? 'Loading…' : `${total} workflow execution${total !== 1 ? 's' : ''} recorded`}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      {!loading && !error && total > 0 && (
        <div className="flex items-center gap-1 border-b border-ds-border mb-6">
          {(['all', 'success', 'error'] as FilterType[]).map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => changeFilter(f)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? 'text-ds-accent border-ds-accent' : 'text-ds-muted border-transparent hover:text-ds-text2'}`}
              >
                {f === 'success' && <CheckCircle2 size={13} />}
                {f === 'error'   && <XCircle      size={13} />}
                {f === 'all'     && <Activity     size={13} />}
                {f === 'all' ? 'All Logs' : f === 'success' ? 'Success' : 'Errors'}
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: logs.length || PAGE_SIZE }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="flex gap-0">
                <div className="w-1 shrink-0 skeleton" style={{ borderRadius: 0 }} />
                <div className="flex-1 px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-7 h-7 shrink-0" />
                      <div>
                        <Skeleton className="h-4 w-48 mb-1.5" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 shrink-0" />
                  </div>
                  <Skeleton className="h-3 w-36 mb-2" />
                  <Skeleton className="h-3 w-52" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="card flex items-center justify-center py-20">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}
      {!loading && !error && total === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-5">
            <Activity size={28} className="text-ds-muted" />
          </div>
          <h2 className="text-ds-text font-semibold text-base mb-2">No logs yet</h2>
          <p className="text-ds-muted text-sm max-w-xs leading-relaxed">
            Workflow execution logs will appear here once your n8n workflows start running.
          </p>
        </div>
      )}
      {!loading && !error && total > 0 && logs.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 px-8 text-center">
          <p className="text-ds-muted text-sm">No {filter} logs found.</p>
        </div>
      )}
      {!loading && !error && logs.length > 0 && (
        <>
          <div className="space-y-3">
            {logs.map((log) => <LogCard key={log.id} log={log} />)}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
              <p className="text-ds-muted text-[11px]">
                Page {page} of {totalPages} · {total} total
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
