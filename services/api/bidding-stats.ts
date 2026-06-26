// lexicon-allow-start: backend endpoint names and sealed wire names
import {
  buildBiddingActivityResponse,
  buildFrequencyBuckets,
  buildRoundStartTimes,
  buildTopBidderActivePeriodsResponse,
  computeTimeBounds,
  excludeCycleOpenHour,
  type GestureTimingPoint,
} from '@/utils/biddingAnalytics';

import { axios, getAPIUrl, isAxiosError } from './client';
import { get_bid_list } from './rounds';
import type {
  BidFrequencyBucket,
  BidTypeRatioBucket,
  BiddingActivityResponse,
  BidTimeBounds,
  TopBidderActivePeriodsResponse,
} from './types';
import { get_unique_bidders } from './users';

let cachedGesturesPromise: ReturnType<typeof get_bid_list> | null = null;
let cachedBiddersPromise: ReturnType<typeof get_unique_bidders> | null = null;

function loadGestures() {
  if (!cachedGesturesPromise) {
    cachedGesturesPromise = get_bid_list();
  }
  return cachedGesturesPromise;
}

function loadBidders() {
  if (!cachedBiddersPromise) {
    cachedBiddersPromise = get_unique_bidders();
  }
  return cachedBiddersPromise;
}

function isMissingEndpoint(err: unknown): boolean {
  const status = isAxiosError(err) ? err.response?.status : undefined;
  // 404 = route not deployed; 400 = legacy handler mismatch before websrv rebuild
  return status === 404 || status === 400;
}

function filterForAnalytics<T extends GestureTimingPoint>(gestures: T[]): T[] {
  const roundStarts = buildRoundStartTimes(gestures);
  return excludeCycleOpenHour(gestures, roundStarts);
}

/** Fetches bid frequency buckets and detected spikes for a time range. */
export async function get_bidding_activity(
  initTs: number,
  finTs: number,
  intervalSecs: number,
): Promise<BiddingActivityResponse> {
  try {
    const { data } = await axios.get(
      getAPIUrl(`statistics/bidding/activity/${initTs}/${finTs}/${intervalSecs}`),
    );
    return {
      InitTs: data.InitTs ?? initTs,
      FinTs: data.FinTs ?? finTs,
      Interval: data.Interval ?? intervalSecs,
      FrequencyHistory: data.FrequencyHistory ?? [],
      Spikes: data.Spikes ?? [],
      RecentSpikeIndex: data.RecentSpikeIndex ?? -1,
      RecentWindowSecs: data.RecentWindowSecs ?? 0,
    };
  } catch (err) {
    if (!isMissingEndpoint(err)) throw err;
    const gestures = filterForAnalytics(await loadGestures());
    return buildBiddingActivityResponse(gestures, initTs, finTs, intervalSecs);
  }
}

/** Fetches bid frequency buckets for a time range. */
export async function get_bid_frequency(
  initTs: number,
  finTs: number,
  intervalSecs: number,
): Promise<BidFrequencyBucket[]> {
  try {
    const { data } = await axios.get(
      getAPIUrl(`statistics/bidding/frequency/${initTs}/${finTs}/${intervalSecs}`),
    );
    return data.FrequencyHistory ?? [];
  } catch (err) {
    if (!isMissingEndpoint(err)) throw err;
    const gestures = filterForAnalytics(await loadGestures());
    return buildFrequencyBuckets(gestures, initTs, finTs, intervalSecs);
  }
}

/** Fetches earliest and latest bid timestamps in the indexed history. */
export async function get_bid_time_bounds(): Promise<BidTimeBounds> {
  try {
    const { data } = await axios.get(getAPIUrl('statistics/bidding/time_bounds'));
    return {
      MinTs: data.MinTs ?? 0,
      MaxTs: data.MaxTs ?? 0,
    };
  } catch (err) {
    if (!isMissingEndpoint(err)) throw err;
    const gestures = await loadGestures();
    return computeTimeBounds(gestures);
  }
}

/**
 * Fetches the per-interval bid-type composition (ETH / RandomWalk / CST) over a
 * time range. Each bucket carries raw counts plus windowed percentages summing
 * to ~100%. Windows with no bids report zeros (a dip to baseline, not a gap).
 */
export async function get_bid_type_ratio(
  fromTs: number,
  toTs: number,
  intervalSecs: number,
): Promise<BidTypeRatioBucket[]> {
  const { data } = await axios.get(getAPIUrl('bid/bid_type_ratio'), {
    params: { from_ts: fromTs, to_ts: toTs, interval_secs: intervalSecs },
  });
  return data.RatioHistory ?? [];
}

/** Fetches active bidding periods for the top N bidders. */
export async function get_top_bidder_active_periods(
  topN: number,
  initTs: number,
  finTs: number,
  gapHours = 6,
  minBids = 2,
): Promise<TopBidderActivePeriodsResponse> {
  try {
    const { data } = await axios.get(
      getAPIUrl(`statistics/bidding/top_active_periods/${topN}/${initTs}/${finTs}`),
      { params: { gap_hours: gapHours, min_bids: minBids } },
    );
    return {
      InitTs: data.InitTs ?? initTs,
      FinTs: data.FinTs ?? finTs,
      TopN: data.TopN ?? topN,
      GapHours: data.GapHours ?? gapHours,
      MinBids: data.MinBids ?? minBids,
      TopBidders: data.TopBidders ?? [],
      ActivePeriods: data.ActivePeriods ?? [],
    };
  } catch (err) {
    if (!isMissingEndpoint(err)) throw err;
    const [gestures, bidders] = await Promise.all([loadGestures(), loadBidders()]);
    return buildTopBidderActivePeriodsResponse(
      gestures,
      bidders,
      topN,
      initTs,
      finTs,
      gapHours,
      minBids,
    );
  }
}
// lexicon-allow-end
