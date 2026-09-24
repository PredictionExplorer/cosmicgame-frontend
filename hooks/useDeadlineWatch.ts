'use client';

import { useEffect, useState } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

/** The reads that together decide the Cycle Finalization Time. */
export const DEADLINE_QUERY_KEYS: readonly QueryKey[] = [
  ['allocationTime'],
  ['currentTime'],
  ['dashboardInfo'],
];

/** How often an armed, hidden tab re-reads the deadline. */
export const BACKGROUND_DEADLINE_REFRESH_MS = 30_000;

/**
 * Keeps the deadline fresh in a hidden tab while something the viewer turned
 * on depends on it: the finalization alert or the tab-title countdown. Live
 * queries pause in the background (`refetchIntervalInBackground: false`), so
 * without this both would count toward the deadline cached when the tab was
 * hidden, and Gestures only ever move that deadline later. Three small reads
 * every 30 seconds, and only while armed and hidden.
 */
export function useBackgroundDeadlineRefresh(
  armed: boolean,
  intervalMs: number = BACKGROUND_DEADLINE_REFRESH_MS,
): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!armed || typeof document === 'undefined') return undefined;
    let timer: ReturnType<typeof setInterval> | null = null;

    const refresh = () => {
      for (const queryKey of DEADLINE_QUERY_KEYS) {
        void queryClient.refetchQueries({ queryKey, exact: true, type: 'active' });
      }
    };
    const sync = () => {
      if (document.visibilityState === 'hidden') {
        timer ??= setInterval(refresh, intervalMs);
      } else if (timer !== null) {
        // Visible again: the queries' own polling and focus refetch take over.
        clearInterval(timer);
        timer = null;
      }
    };

    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      if (timer !== null) clearInterval(timer);
    };
  }, [armed, intervalMs, queryClient]);
}

export interface ReturnResyncOptions {
  /** A deadline read older than this on return counts as stale. */
  maxAgeMs?: number;
  /** Stop waiting for the fresh read after this long. */
  timeoutMs?: number;
}

const ALLOCATION_TIME_KEY = JSON.stringify(['allocationTime']);

/**
 * True from the moment the tab becomes visible with a stale deadline until
 * the first fresh reading of it lands (or `timeoutMs` passes). While true the
 * page must not read a locally elapsed clock as "ready to finalize": a
 * Gesture may have moved the deadline while the tab was hidden, and a
 * Finalize sent on the stale reading would revert and still cost gas.
 */
export function useReturnResync({
  maxAgeMs = BACKGROUND_DEADLINE_REFRESH_MS,
  timeoutMs = 10_000,
}: ReturnResyncOptions = {}): boolean {
  const queryClient = useQueryClient();
  const [resyncing, setResyncing] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: (() => void) | null = null;

    const stopWaiting = () => {
      if (timeout !== null) clearTimeout(timeout);
      timeout = null;
      unsubscribe?.();
      unsubscribe = null;
    };
    const finish = () => {
      stopWaiting();
      setResyncing(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || unsubscribe) return;
      const updatedAt = queryClient.getQueryState(['allocationTime'])?.dataUpdatedAt ?? 0;
      if (updatedAt > 0 && Date.now() - updatedAt <= maxAgeMs) return;

      const returnedAt = Date.now();
      setResyncing(true);
      unsubscribe = queryClient.getQueryCache().subscribe((event) => {
        if (event.type !== 'updated' || event.action.type !== 'success') return;
        if (JSON.stringify(event.query.queryKey) !== ALLOCATION_TIME_KEY) return;
        if (event.query.state.dataUpdatedAt >= returnedAt) finish();
      });
      timeout = setTimeout(finish, timeoutMs);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopWaiting();
    };
  }, [maxAgeMs, queryClient, timeoutMs]);

  return resyncing;
}
