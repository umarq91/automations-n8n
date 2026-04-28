import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, XCircle, Package, ExternalLink, X, CheckCheck, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeCreditLogs } from '../../hooks/useRealtimeCreditLogs';
import { formatRelative } from '../../lib/utils';
import type { WorkflowNotification } from '../../hooks/useRealtimeCreditLogs';

function NotificationItem({ n }: { n: WorkflowNotification }) {
  const isSuccess = n.type === 'success';
  const isError   = n.type === 'error';

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-ds-borderSoft last:border-0 transition-colors ${n._read ? '' : 'bg-ds-accent/[0.04]'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isSuccess ? 'bg-emerald-500/10' : isError ? 'bg-red-500/10' : 'bg-ds-surface2'}`}>
        {isSuccess && <CheckCircle2 size={13} className="text-emerald-400" />}
        {isError   && <XCircle      size={13} className="text-red-400" />}
        {!isSuccess && !isError && <Activity size={13} className="text-ds-muted" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-xs font-semibold ${isSuccess ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-ds-text2'}`}>
            {isSuccess ? 'Workflow succeeded' : isError ? 'Workflow failed' : 'Workflow executed'}
          </span>
          <span className="text-[10px] text-ds-muted shrink-0">
            {formatRelative(n.created_at) ?? new Date(n.created_at).toLocaleDateString()}
          </span>
        </div>
        {n.workflow_name && (
          <p className="text-xs text-ds-text2 truncate font-medium">{n.workflow_name}</p>
        )}
        {n.product_title && (
          <p className="text-[11px] text-ds-muted truncate flex items-center gap-1 mt-0.5">
            <Package size={9} className="shrink-0" />{n.product_title}
          </p>
        )}
        {isError && n.message && (
          <p className="text-[11px] text-red-400/80 truncate mt-0.5">{n.message}</p>
        )}
        {n.execution_url && (
          <a
            href={n.execution_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-ds-accent hover:text-ds-accentHover transition-colors mt-1"
          >
            <ExternalLink size={9} />View execution
          </a>
        )}
      </div>
      {!n._read && (
        <div className="w-1.5 h-1.5 rounded-full bg-ds-accent shrink-0 mt-2" />
      )}
    </div>
  );
}

export default function NotificationBell() {
  const { activeOrg } = useAuth();
  const { notifications, unreadCount, loading, markAllRead, clear } = useRealtimeCreditLogs(activeOrg?.id);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      markAllRead();
      document.addEventListener('mousedown', onClickOutside);
    }
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Mobile backdrop — behind panel (z-40 < panel z-50) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative p-2 rounded-xl bg-ds-surface border border-ds-border hover:bg-ds-hover transition group"
          title="Workflow notifications"
          aria-label="Notifications"
        >
          <Bell size={14} className="text-ds-muted group-hover:text-ds-text2 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-ds-accent text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="fixed top-[57px] left-2 right-2 z-50 bg-ds-surface border border-ds-border rounded-xl shadow-card overflow-hidden sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 sm:max-w-[calc(100vw-1rem)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ds-border">
              <span className="text-ds-text text-sm font-semibold">Workflow Logs</span>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clear}
                    className="flex items-center gap-1 text-[11px] text-ds-muted hover:text-ds-text2 transition-colors px-1.5 py-0.5 rounded"
                  >
                    <X size={11} />Clear
                  </button>
                )}
                {notifications.some((n) => !n._read) && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-ds-accent hover:text-ds-accentHover transition-colors px-1.5 py-0.5 rounded"
                  >
                    <CheckCheck size={11} />Mark read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="sm:hidden p-1 rounded text-ds-muted hover:text-ds-text2 transition-colors"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-ds-muted">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs">Loading…</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <Activity size={22} className="text-ds-muted mb-3" />
                  <p className="text-ds-text2 text-xs font-medium">No activity yet</p>
                  <p className="text-ds-muted text-[11px] mt-1">Workflow execution results will appear here in real-time.</p>
                </div>
              ) : (
                notifications.map((n) => <NotificationItem key={n.id} n={n} />)
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
