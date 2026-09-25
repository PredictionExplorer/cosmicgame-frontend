import { cache } from 'react';

import type { CacheWindow } from '@/lib/cacheWindow';
import type { DashboardInfo } from '@/services/api/types';
// lexicon-allow-start: the reads mirror the backend routes statistics/bidding/*
import {
  get_bid_frequency as readFrequency,
  get_bid_time_bounds as readTimeBounds,
  get_bidding_activity as readSpikes,
  get_top_bidder_active_periods as readActivePeriods,
} from '@/services/api/bidding-stats';
// lexicon-allow-end
import {
  ACTIVE_PERIODS_TOP_N,
  activePeriodsRange,
  defaultSpikeIndex,
  frequencyRange,
  gestureSpan,
  hasGestureBounds,
  spikeSearchRange,
  spikeViewRange,
} from '@/components/statistics/charts/activityRanges';

import { readDashboard, readSystemModes } from '../../publicDataReads';
import { seedsDisabled, type QuerySeedEntry } from '../../QuerySeed';

export interface ActivityRead {
  /** The client queries the first HTML renders from. */
  seeds: QuerySeedEntry[];
  /** The dashboard, for the every-gesture total beside the frequency chart's own. */
  dashboard: DashboardInfo | null;
  /** How long the page's render may be served (`lib/cacheWindow`). */
  cacheWindow: CacheWindow;
}

/** One read, seeded under `queryKey`, or null when it failed. */
async function seed(
  queryKey: readonly unknown[],
  read: () => Promise<unknown>,
): Promise<QuerySeedEntry | null> {
  try {
    return { queryKey, data: await read(), at: Date.now() };
  } catch {
    return null;
  }
}

/**
 * The server reads behind /statistics/activity's all-time sections, keyed
 * like the charts' hooks, so their figures (the busiest day, the spike, the
 * most active participants) are the first HTML rather than skeletons filled
 * after hydration:
 *
 * - the indexed history's bounds, from which every range follows
 *   (`activityRanges`, the module the charts take their keys from);
 * - the daily frequency, the spikes and the hours around the one the chart
 *   opens on, and the most active participants' periods;
 * - the cycle activations the closed log counts, and the dashboard, whose
 *   every-gesture total the frequency chart reads beside its own.
 *
 * The spikes' seed leaves out the hourly history that answer also carries
 * (some 180 KB a year): the chart reads only the spikes, and its refresh
 * after hydration brings the whole answer back. The cycle charts below
 * follow the live cycle, which the page reads only after hydration, so they
 * are not seeded. A failed read seeds nothing and keeps the render a minute;
 * nothing is read under the e2e harness, whose browser mocks the API.
 */
export const readActivity = cache(async (): Promise<ActivityRead> => {
  if (seedsDisabled()) return { seeds: [], dashboard: null, cacheWindow: 'pending' };
  const [bounds, modes, { data: dashboard }] = await Promise.all([
    seed(['bidTimeBounds'], () => readTimeBounds()),
    readSystemModes(),
    readDashboard(),
  ]);
  const seeds: QuerySeedEntry[] = [];
  if (bounds) seeds.push(bounds);
  if (modes.data !== null) {
    seeds.push({ queryKey: ['systemModelist'], data: modes.data, at: modes.at });
  }
  const answer = bounds?.data as Parameters<typeof gestureSpan>[0];
  // Without the bounds the charts range from the moment they mount: nothing to seed.
  if (!hasGestureBounds(answer)) return { seeds, dashboard, cacheWindow: 'pending' };

  const span = gestureSpan(answer, 0);
  const daily = frequencyRange(span, 'day');
  const search = spikeSearchRange(span);
  const periods = activePeriodsRange(span);
  const [frequency, spikes, activePeriods] = await Promise.all([
    seed(['bidFrequency', daily.initTs, daily.finTs, daily.intervalSecs], () =>
      readFrequency(daily.initTs, daily.finTs, daily.intervalSecs),
    ),
    seed(['biddingActivity', search.initTs, search.finTs, search.intervalSecs], async () => {
      const { FrequencyHistory: _hours, ...rest } = await readSpikes(
        search.initTs,
        search.finTs,
        search.intervalSecs,
      );
      return { ...rest, FrequencyHistory: [] };
    }),
    seed(['topBidderActivePeriods', ACTIVE_PERIODS_TOP_N, periods.initTs, periods.finTs], () =>
      readActivePeriods(ACTIVE_PERIODS_TOP_N, periods.initTs, periods.finTs),
    ),
  ]);
  const found = [frequency, spikes, activePeriods];
  for (const entry of found) if (entry) seeds.push(entry);

  // The hours drawn around the spike the chart opens on.
  const answered = spikes?.data as
    | { Spikes: { StartTs: number; EndTs: number }[]; RecentSpikeIndex: number }
    | undefined;
  const opened = answered ? defaultSpikeIndex(answered.Spikes, answered.RecentSpikeIndex) : null;
  if (answered && opened !== null) {
    const view = spikeViewRange(answered.Spikes[opened]!);
    const hours = await seed(['bidFrequency', view.initTs, view.finTs, search.intervalSecs], () =>
      readFrequency(view.initTs, view.finTs, search.intervalSecs),
    );
    if (hours) seeds.push(hours);
    else found.push(null);
  }
  return {
    seeds,
    dashboard,
    cacheWindow:
      modes.data !== null && dashboard !== null && found.every(Boolean) ? 'live' : 'pending',
  };
});
