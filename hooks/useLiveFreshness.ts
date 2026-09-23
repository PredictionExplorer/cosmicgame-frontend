'use client';

import { useSyncExternalStore } from 'react';
import {
  onlineManager,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';

import { DATA_POLL_INTERVAL_MS } from '@/config/constants';
import { useNow } from '@/hooks/useNow';
import { getLiveFreshness, type LiveFreshness } from '@/lib/liveFreshness';

/** The dashboard snapshot drives every live surface of the Cycle. */
export const DEFAULT_LIVE_QUERY_KEYS: readonly QueryKey[] = [['dashboardInfo']];

export interface LiveFreshnessState {
  state: LiveFreshness;
  /** When data last arrived from the network (epoch ms), or null. */
  lastSuccessAtMs: number | null;
  /** Milliseconds since that update (0 when none), refreshed every second. */
  ageMs: number;
}

interface QuerySnapshot {
  lastSuccessAtMs: number;
  lastAttemptFailed: boolean;
}

const NO_DATA = '0|0';

function subscribeOnline(callback: () => void): () => void {
  return onlineManager.subscribe(callback);
}

function getOnline(): boolean {
  return onlineManager.isOnline();
}

function getServerOnline(): boolean {
  return true;
}

interface QueryFreshnessStore {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => string;
}

/**
 * A tiny external store over React Query's cache: the snapshot is a string
 * ("<last success ms>|<failed flag>") so `useSyncExternalStore` only
 * re-renders when one of the two facts actually changes.
 */
function createQueryFreshnessStore(
  queryClient: QueryClient,
  keySignature: string,
): QueryFreshnessStore {
  const queryKeys = JSON.parse(keySignature) as QueryKey[];
  const cache = queryClient.getQueryCache();
  return {
    subscribe: (callback: () => void) => cache.subscribe(callback),
    getSnapshot: (): string => {
      let lastSuccessAtMs = 0;
      let lastAttemptFailed = false;
      for (const queryKey of queryKeys) {
        for (const query of cache.findAll({ queryKey })) {
          const { dataUpdatedAt, fetchFailureCount, status } = query.state;
          lastSuccessAtMs = Math.max(lastSuccessAtMs, dataUpdatedAt);
          // React Query resets the failure count on success, so a non-zero
          // count means the latest attempt failed (retrying or given up).
          if (fetchFailureCount > 0 || status === 'error') lastAttemptFailed = true;
        }
      }
      return `${lastSuccessAtMs}|${lastAttemptFailed ? 1 : 0}`;
    },
  };
}

/**
 * One store per query client and key set, shared by every indicator that
 * watches the same queries, so `subscribe` / `getSnapshot` keep their
 * identity across renders without per-component memoization.
 */
const storesByClient = new WeakMap<QueryClient, Map<string, QueryFreshnessStore>>();

function getQueryFreshnessStore(
  queryClient: QueryClient,
  keySignature: string,
): QueryFreshnessStore {
  let stores = storesByClient.get(queryClient);
  if (!stores) {
    stores = new Map();
    storesByClient.set(queryClient, stores);
  }
  let store = stores.get(keySignature);
  if (!store) {
    store = createQueryFreshnessStore(queryClient, keySignature);
    stores.set(keySignature, store);
  }
  return store;
}

export interface UseLiveFreshnessOptions {
  /** Queries whose updates count as "live data" (prefix match). */
  queryKeys?: readonly QueryKey[];
  /** The surface's poll interval (stretches the delayed threshold). */
  pollIntervalMs?: number;
}

/**
 * Freshness of the live data behind a surface, from React Query's own cache:
 * the newest successful fetch among `queryKeys`, whether a fetch failed after
 * it, and the browser's online state. Pair with `LiveStatus`.
 *
 * Server-rendered seeds are dated 0 (`initialDataUpdatedAt: 0`), so the first
 * render — server and hydration alike — is `connecting`; there is no
 * hydration mismatch because the server snapshot is the same.
 */
export function useLiveFreshness({
  queryKeys = DEFAULT_LIVE_QUERY_KEYS,
  pollIntervalMs = DATA_POLL_INTERVAL_MS,
}: UseLiveFreshnessOptions = {}): LiveFreshnessState {
  const queryClient = useQueryClient();
  const keySignature = JSON.stringify(queryKeys);

  const store = getQueryFreshnessStore(queryClient, keySignature);

  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, () => NO_DATA);
  const online = useSyncExternalStore(subscribeOnline, getOnline, getServerOnline);
  const now = useNow(1_000);

  const [successPart, failedPart] = snapshot.split('|');
  const parsed: QuerySnapshot = {
    lastSuccessAtMs: Number(successPart) || 0,
    lastAttemptFailed: failedPart === '1',
  };
  const state = getLiveFreshness({
    lastSuccessAtMs: parsed.lastSuccessAtMs,
    lastAttemptFailed: parsed.lastAttemptFailed,
    online,
    pollIntervalMs,
    // Before the first client tick (SSR, hydration) treat the data as fresh
    // relative to itself so nothing reads as delayed.
    nowMs: now || parsed.lastSuccessAtMs,
  });

  return {
    state,
    lastSuccessAtMs: parsed.lastSuccessAtMs || null,
    ageMs: parsed.lastSuccessAtMs && now ? Math.max(0, now - parsed.lastSuccessAtMs) : 0,
  };
}
