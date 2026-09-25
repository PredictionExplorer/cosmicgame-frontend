import { cache } from 'react';

import type { DashboardInfo } from '@/services/api/types';
import { get_staked_cst_tokens, get_staked_rwalk_tokens } from '@/services/api/anchoring';
import { get_unique_cst_stakers, get_unique_rwalk_stakers } from '@/services/api/users';

import {
  readAnchorCstActions,
  readAnchorRwalkActions,
  readDashboard,
  type TimedRead,
} from '../../publicDataReads';
import { seedsDisabled, type QuerySeedEntry } from '../../QuerySeed';

async function timed<T>(read: () => Promise<T>): Promise<TimedRead<T>> {
  try {
    return { data: await read(), at: Date.now() };
  } catch {
    return { data: null, at: Date.now() };
  }
}

export interface AnchoringStatisticsRead {
  /** The dashboard's anchoring figures, for the first render of the panel's figures. */
  dashboard: TimedRead<DashboardInfo | null>;
  /** The ledgers' lists, keyed like their client hooks. */
  seeds: QuerySeedEntry[];
  /** When the newest read resolved, for the header's snapshot stamp; `null` if none did. */
  at: number | null;
}

/**
 * The server reads behind /statistics/anchoring: the dashboard's figures and
 * the six lists its ledgers show (both collections' actions, anchored NFTs
 * and anchor-holders), so the figures and the ledgers are in the first HTML
 * instead of seven client reads after hydration. A failed read seeds nothing
 * and the browser reads it; nothing is seeded under the e2e harness.
 */
export const readAnchoringStatistics = cache(async (): Promise<AnchoringStatisticsRead> => {
  const [dashboard, cstActions, rwlkActions, cstTokens, rwlkTokens, cstHolders, rwlkHolders] =
    await Promise.all([
      readDashboard(),
      readAnchorCstActions(),
      readAnchorRwalkActions(),
      timed(() => get_staked_cst_tokens()),
      timed(() => get_staked_rwalk_tokens()),
      timed(() => get_unique_cst_stakers()),
      timed(() => get_unique_rwalk_stakers()),
    ]);
  const lists: [string, TimedRead<unknown>][] = [
    ['cstAnchorActions', cstActions],
    ['rwlkAnchorActions', rwlkActions],
    ['stakedCSTTokensGlobal', cstTokens],
    ['stakedRWLKTokensGlobal', rwlkTokens],
    ['uniqueCSTAnchorHolders', cstHolders],
    ['uniqueRWLKAnchorHolders', rwlkHolders],
  ];
  const resolved = [dashboard, ...lists.map(([, read]) => read)].filter(
    (read) => read.data !== null,
  );
  return {
    dashboard: seedsDisabled() ? { data: null, at: dashboard.at } : dashboard,
    seeds: seedsDisabled()
      ? []
      : lists.map(([key, read]) => ({ queryKey: [key], data: read.data, at: read.at })),
    at: resolved.length > 0 ? Math.max(...resolved.map((read) => read.at)) : null,
  };
});
