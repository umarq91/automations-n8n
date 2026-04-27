import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { WorkflowLog } from '../lib/supabase/types';

export interface WorkflowNotification extends WorkflowLog {
  _read: boolean;
}

export function useRealtimeCreditLogs(orgId: string | undefined) {
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const unreadCount = notifications.filter((n) => !n._read).length;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!orgId) return;

    setNotifications([]);

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
          setNotifications((prev) => [{ ...log, _read: false }, ...prev].slice(0, 30));
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
  }

  return { notifications, unreadCount, markAllRead, clear };
}
