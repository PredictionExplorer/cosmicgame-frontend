import type { ReactNode } from 'react';
import { HydrationBoundary, QueryClient, dehydrate, type QueryKey } from '@tanstack/react-query';

import { readDashboard } from './publicDataReads';

export interface QuerySeedEntry {
  /** Must equal the key of the client hook that reads it (hooks/useApiQuery.ts). */
  queryKey: QueryKey;
  /** The server read's result; `null` (a failed read) seeds nothing. */
  data: unknown;
  /** When the data was read (epoch ms); React Query dates the entry to it and refreshes it once stale. */
  at: number;
}

/**
 * Whether seeding is off: under the e2e harness (`PLAYWRIGHT=1`), which mocks
 * the public API in the browser. A fresh seed is not refetched on mount, so it
 * would put live production rows where the specs expect their deterministic
 * fixtures; without seeds the client reads the mocks, as it did before.
 */
export function seedsDisabled(): boolean {
  return process.env.PLAYWRIGHT === '1';
}

/**
 * Hands server reads to the client's React Query cache, so a page's client
 * components render the data in the server HTML and never show a spinner for
 * data the server just read. Newer client data always wins over a seed.
 */
export function QuerySeed({ seeds, children }: { seeds: QuerySeedEntry[]; children: ReactNode }) {
  if (seedsDisabled()) return <>{children}</>;
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
 * read, dated to that read. The app shell creates the dashboard query before
 * any page renders, so React Query hydrates this seed right after hydration
 * (not into the server HTML — page headers carry their own server values,
 * see `DashboardFigure`): the page body then renders the server's data at
 * once instead of waiting for its first poll. A hydrated seed is not a fetch,
 * so `LiveStatus` keeps saying "Connecting" until the first poll succeeds.
 */
export async function DashboardQuerySeed({ children }: { children: ReactNode }) {
  const dashboard = await readDashboard();
  return (
    <QuerySeed seeds={[{ queryKey: ['dashboardInfo'], data: dashboard.data, at: dashboard.at }]}>
      {children}
    </QuerySeed>
  );
}
