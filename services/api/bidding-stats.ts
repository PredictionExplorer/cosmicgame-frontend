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

import { apiGet, getAPIUrl, isAxiosError, type ApiRequestOptions } from './client';
import { get_bid_list } from './rounds';
import {
  BidFrequencyBucketSchema,
  BidTimeBoundsSchema,
  BidTypeRatioBucketSchema,
  BiddingActivityResponseSchema,
  TopBidderActivePeriodsResponseSchema,
  safeValidate,
  safeValidateListSample,
} from './schemas';
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
    // Drop a rejected promise from the cache: the gesture list is a required
    // read now, and caching the rejection would keep every analytics chart
    // broken for the rest of the session.
    cachedGesturesPromise = get_bid_list().catch((err: unknown) => {
      cachedGesturesPromise = null;
      throw err;
    });
  }
  return cachedGesturesPromise;
}

function loadBidders() {
  if (!cachedBiddersPromise) {
    cachedBiddersPromise = get_unique_bidders().catch((err: unknown) => {
      cachedBiddersPromise = null;
      throw err;
    });
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
  opts?: ApiRequestOptions,
): Promise<BiddingActivityResponse> {
  try {
    const { data } = await apiGet(
      getAPIUrl(`statistics/bidding/activity/${initTs}/${finTs}/${intervalSecs}`),
      opts,
    );
    return safeValidate(
      BiddingActivityResponseSchema,
      {
        InitTs: data.InitTs ?? initTs,
        FinTs: data.FinTs ?? finTs,
        Interval: data.Interval ?? intervalSecs,
        FrequencyHistory: data.FrequencyHistory ?? [],
        Spikes: data.Spikes ?? [],
        RecentSpikeIndex: data.RecentSpikeIndex ?? -1,
        RecentWindowSecs: data.RecentWindowSecs ?? 0,
      },
      'biddingActivity',
    ) as BiddingActivityResponse;
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
  opts?: ApiRequestOptions,
): Promise<BidFrequencyBucket[]> {
  try {
    const { data } = await apiGet(
      getAPIUrl(`statistics/bidding/frequency/${initTs}/${finTs}/${intervalSecs}`),
      opts,
    );
    return safeValidateListSample(
      BidFrequencyBucketSchema,
      data.FrequencyHistory ?? [],
      'bidFrequency',
    ) as BidFrequencyBucket[];
  } catch (err) {
    if (!isMissingEndpoint(err)) throw err;
    const gestures = filterForAnalytics(await loadGestures());
    return buildFrequencyBuckets(gestures, initTs, finTs, intervalSecs);
  }
}

/** Fetches earliest and latest bid timestamps in the indexed history. */
export async function get_bid_time_bounds(opts?: ApiRequestOptions): Promise<BidTimeBounds> {
  try {
    const { data } = await apiGet(getAPIUrl('statistics/bidding/time_bounds'), opts);
    return safeValidate(
      BidTimeBoundsSchema,
      { MinTs: data.MinTs ?? 0, MaxTs: data.MaxTs ?? 0 },
      'bidTimeBounds',
    ) as BidTimeBounds;
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
 *
 * There is no client-side reconstruction for this series, so a server without
 * the route yields an empty series; every other failure propagates.
 */
export async function get_bid_type_ratio(
  fromTs: number,
  toTs: number,
  intervalSecs: number,
  opts?: ApiRequestOptions,
): Promise<BidTypeRatioBucket[]> {
  try {
    const { data } = await apiGet(getAPIUrl('bid/bid_type_ratio'), opts, {
      params: { from_ts: fromTs, to_ts: toTs, interval_secs: intervalSecs },
    });
    return safeValidateListSample(
      BidTypeRatioBucketSchema,
      data.RatioHistory ?? [],
      'bidTypeRatio',
    ) as BidTypeRatioBucket[];
  } catch (err) {
    if (!isMissingEndpoint(err)) throw err;
    return [];
  }
}

/** Grouping options for {@link get_top_bidder_active_periods}. */
export interface TopBidderActivePeriodsOptions extends ApiRequestOptions {
  /** Idle gap (hours) that ends an active period. */
  gapHours?: number;
  /** Minimum gestures for a period to count. */
  minBids?: number;
}

/** Fetches active bidding periods for the top N bidders. */
export async function get_top_bidder_active_periods(
  topN: number,
  initTs: number,
  finTs: number,
  opts?: TopBidderActivePeriodsOptions,
): Promise<TopBidderActivePeriodsResponse> {
  const gapHours = opts?.gapHours ?? 6;
  const minBids = opts?.minBids ?? 2;
  try {
    const { data } = await apiGet(
      getAPIUrl(`statistics/bidding/top_active_periods/${topN}/${initTs}/${finTs}`),
      opts,
      { params: { gap_hours: gapHours, min_bids: minBids } },
    );
    return safeValidate(
      TopBidderActivePeriodsResponseSchema,
      {
        InitTs: data.InitTs ?? initTs,
        FinTs: data.FinTs ?? finTs,
        TopN: data.TopN ?? topN,
        GapHours: data.GapHours ?? gapHours,
        MinBids: data.MinBids ?? minBids,
        TopBidders: data.TopBidders ?? [],
        ActivePeriods: data.ActivePeriods ?? [],
      },
      'topBidderActivePeriods',
    ) as TopBidderActivePeriodsResponse;
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
