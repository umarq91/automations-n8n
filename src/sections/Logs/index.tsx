import { useEffect, useState } from 'react';
import {
  Activity, CheckCircle2, XCircle, ExternalLink,
  Package, GitBranch, Clock, Cpu, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WorkflowLogModel } from '../../models/WorkflowLogModel';
import type { WorkflowLog } from '../../lib/supabase/types';
import { formatRelative } from '../../lib/utils';

type FilterType = 'all' | 'success' | 'error';

function LogCard({ log }: { log: WorkflowLog }) {
  const isSuccess = log.type === 'success';
  const isError   = log.type === 'error';

  return (
    <div className={`card overflow-hidden border-l-2 transition-colors hover:border-l-2 ${isSuccess ? 'border-l-emerald-500/60 hover:border-l-emerald-500' : isError ? 'border-l-red-500/60 hover:border-l-red-500' : 'border-l-ds-border'}`}>
      <div className="px-5 py-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {isSuccess && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
            {isError   && <XCircle      size={15} className="text-red-400 shrink-0" />}
            {!isSuccess && !isError && <Activity size={15} className="text-ds-muted shrink-0" />}
            <span className="text-ds-text font-semibold text-sm truncate">
              {log.workflow_name ?? 'Unnamed Workflow'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${
              isSuccess ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
              isError   ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                          'text-ds-muted bg-ds-surface2 border-ds-border'
            }`}>
              {isSuccess ? 'Success' : isError ? 'Error' : log.type ?? 'Unknown'}
            </span>
            <span className="flex items-center gap-1 text-ds-muted text-xs">
              <Clock size={10} />
              {formatRelative(log.created_at) ?? new Date(log.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
          {log.execution_id && (
            <span className="flex items-center gap-1.5 text-xs text-ds-text2">
              <Cpu size={11} className="text-ds-muted" />
              <code className="font-mono text-[11px] text-ds-muted">{log.execution_id}</code>
            </span>
          )}
          {log.workflow_id && (
            <span className="flex items-center gap-1.5 text-xs text-ds-text2">
              <GitBranch size={11} className="text-ds-muted" />
              <code className="font-mono text-[11px] text-ds-muted">{log.workflow_id}</code>
            </span>
          )}
          {log.product_title && (
            <span className="flex items-center gap-1.5 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md">
              <Package size={10} className="text-ds-muted" />
              {log.product_title}
            </span>
          )}
        </div>

        {/* Error details */}
        {isError && (log.error_message || log.error_description || log.last_node_executed) && (
          <div className="bg-red-500/5 border border-red-500/15 rounded-lg px-3.5 py-3 space-y-1.5">
            {log.error_message && (
              <p className="text-red-400 text-xs font-medium leading-relaxed">{log.error_message}</p>
            )}
            {log.error_description && log.error_description !== log.error_message && (
              <p className="text-red-400/70 text-xs leading-relaxed">{log.error_description}</p>
            )}
            {log.last_node_executed && (
              <p className="text-ds-muted text-[11px]">
                Last node: <span className="font-mono text-ds-text2">{log.last_node_executed}</span>
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        {log.execution_url && (
          <div className="mt-3 pt-3 border-t border-ds-borderSoft flex items-center justify-end">
            <a
              href={log.execution_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-ds-accent hover:text-ds-accentHover transition-colors"
            >
              <ExternalLink size={11} />
              View execution
              <ChevronRight size={11} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LogsSection() {
  const { activeOrg } = useAuth();
  const [logs,    setLogs]    = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filter,  setFilter]  = useState<FilterType>('all');

  useEffect(() => {
    if (!activeOrg) return;
    setLoading(true);
    setError(null);
    WorkflowLogModel.getAll(activeOrg.id)
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeOrg]);

  const filtered = logs.filter((l) => filter === 'all' || l.type === filter);
  const successCount = logs.filter((l) => l.type === 'success').length;
  const errorCount   = logs.filter((l) => l.type === 'error').length;

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
            {loading ? 'Loading…' : `${logs.length} workflow execution${logs.length !== 1 ? 's' : ''} recorded`}
          </p>
        </div>
      </div>

      {/* Stats chips */}
      {!loading && !error && logs.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-ds-surface2 border border-ds-borderSoft rounded-xl px-4 py-2.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-ds-text2 text-xs font-medium">{successCount} successful</span>
          </div>
          <div className="flex items-center gap-2 bg-ds-surface2 border border-ds-borderSoft rounded-xl px-4 py-2.5">
            <XCircle size={13} className="text-red-400" />
            <span className="text-ds-text2 text-xs font-medium">{errorCount} failed</span>
          </div>
          {errorCount > 0 && successCount > 0 && (
            <div className="flex items-center gap-2 bg-ds-surface2 border border-ds-borderSoft rounded-xl px-4 py-2.5">
              <Activity size={13} className="text-ds-accent" />
              <span className="text-ds-text2 text-xs font-medium">
                {Math.round((successCount / logs.length) * 100)}% success rate
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && !error && logs.length > 0 && (
        <div className="flex items-center gap-1 border-b border-ds-border mb-6">
          {(['all', 'success', 'error'] as FilterType[]).map((f) => {
            const count = f === 'all' ? logs.length : f === 'success' ? successCount : errorCount;
            if (f !== 'all' && count === 0) return null;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${active ? 'text-ds-accent border-ds-accent' : 'text-ds-muted border-transparent hover:text-ds-text2'}`}
              >
                {f === 'success' && <CheckCircle2 size={13} />}
                {f === 'error'   && <XCircle      size={13} />}
                {f === 'all'     && <Activity     size={13} />}
                {f === 'all' ? 'All Logs' : f === 'success' ? 'Success' : 'Errors'}
                <span className={`text-xs px-1.5 py-0.5 rounded ${active ? 'bg-ds-accent/10 text-ds-accent' : 'bg-ds-surface2 text-ds-muted'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="card flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-ds-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="card flex items-center justify-center py-20">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}
      {!loading && !error && logs.length === 0 && (
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
      {!loading && !error && filtered.length === 0 && logs.length > 0 && (
        <div className="card flex flex-col items-center justify-center py-16 px-8 text-center">
          <p className="text-ds-muted text-sm">No {filter} logs found.</p>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((log) => <LogCard key={log.id} log={log} />)}
        </div>
      )}
    </div>
  );
}
