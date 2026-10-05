'use client';

import { useCallback, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';

import { isLiveGameQueryKey } from '@/lib/liveGameQueryKeys';

/** The chain-event refresh: the RPC client, the ABI and the polling loop. */
const LiveGameDataRefresh = dynamic(() => import('./LiveGameDataRefreshIsland'), { ssr: false });

/** Query clients whose pages have shown live data: the refresh, once started, stays. */
const started = new WeakSet<QueryClient>();

function showsLiveData(queryClient: QueryClient): boolean {
  if (started.has(queryClient)) return true;
  const live = queryClient
    .getQueryCache()
    .getAll()
    .some((query) => query.getObserversCount() > 0 && isLiveGameQueryKey(query.queryKey));
  if (live) started.add(queryClient);
  return live;
}

/**
 * Starts the chain-event refresh (hooks/useLiveGameDataRefresh) once the page
 * observes a query that a chain event refreshes: the dashboard, the gesture
 * feed, the contribution ledgers. A page that shows none (the legal pages,
 * the FAQ, the site map) never downloads the event polling or asks an RPC
 * node for logs. Once started it keeps running for the session, so data
 * that arrives while the visitor reads another page is fresh on return.
 */
export function LiveGameDataRefreshGate() {
  const queryClient = useQueryClient();
  const subscribe = useCallback(
    (onChange: () => void) => queryClient.getQueryCache().subscribe(onChange),
    [queryClient],
  );
  const live = useSyncExternalStore(
    subscribe,
    () => showsLiveData(queryClient),
    () => false,
  );
  return live ? <LiveGameDataRefresh /> : null;
}
