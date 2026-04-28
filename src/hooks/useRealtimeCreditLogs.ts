import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { WorkflowLogModel } from '../models/WorkflowLogModel';
import type { WorkflowLog } from '../lib/supabase/types';

export interface WorkflowNotification extends WorkflowLog {
  _read: boolean;
}

export function useRealtimeCreditLogs(orgId: string | undefined) {
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter((n) => !n._read).length;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!orgId) return;

    setNotifications([]);
    seenIds.current = new Set();
    setLoading(true);

    // Load persisted logs first (all marked read — they're historical)
    WorkflowLogModel.getRecent(orgId, 30)
      .then((logs) => {
        const historical = logs.map((l) => ({ ...l, _read: true }));
        historical.forEach((l) => seenIds.current.add(l.id));
        setNotifications(historical);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Layer realtime inserts on top as unread
    channelRef.current = supabase
      .channel(`workflow_logs_realtime:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_logs',
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          const log = payload.new as WorkflowLog;
          if (seenIds.current.has(log.id)) return;
          seenIds.current.add(log.id);
          setNotifications((prev) => [{ ...log, _read: false }, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orgId]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, _read: true })));
  }

  function clear() {
    setNotifications([]);
    seenIds.current = new Set();
  }

  return { notifications, unreadCount, loading, markAllRead, clear };
}
