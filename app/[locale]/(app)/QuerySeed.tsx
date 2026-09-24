import type { ReactNode } from 'react';
import { HydrationBoundary, QueryClient, dehydrate, type QueryKey } from '@tanstack/react-query';

import { readDashboard } from './publicDataReads';

export interface QuerySeedEntry {
  /** Must equal the key of the client hook that reads it (hooks/useApiQuery.ts). */
  queryKey: QueryKey;
  /** The server read's result; `null` (a failed read) seeds nothing. */
  data: unknown;
  /**
   * When the data was read (epoch ms); React Query dates the entry to it and
   * refreshes it once stale. `0` marks a seed that must never count as a live
   * reading (the live dashboard), so `LiveStatus` says "Connecting" until the
   * first client fetch.
   */
  at: number;
}

/**
 * Hands server reads to the client's React Query cache, so a page's client
 * components render the data in the server HTML and never show a spinner for
 * data the server just read. Newer client data always wins over a seed.
 */
export function QuerySeed({ seeds, children }: { seeds: QuerySeedEntry[]; children: ReactNode }) {
  const usable = seeds.filter((seed) => seed.data !== null && seed.data !== undefined);
  if (usable.length === 0) return <>{children}</>;
  const client = new QueryClient();
  for (const { queryKey, data, at } of usable) {
    client.setQueryData(queryKey, data, { updatedAt: at });
  }
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}

/**
 * Seeds the live dashboard (`useDashboardInfo`) from this request's server
 * read, dated 0 so the first client poll replaces it right after hydration.
 */
export async function DashboardQuerySeed({ children }: { children: ReactNode }) {
  const dashboard = await readDashboard();
  return (
    <QuerySeed seeds={[{ queryKey: ['dashboardInfo'], data: dashboard.data, at: 0 }]}>
      {children}
    </QuerySeed>
  );
}
