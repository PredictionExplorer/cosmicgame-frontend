import { unstable_cache } from 'next/cache';

import { get_bid_list_by_round } from '@/services/api/rounds';

/** How long the live cycle's count serves every request before one refreshes it. */
export const LIVE_LANES_SECONDS = 60;

/** Distinct gesture makers in a gesture list: every gesture hands its maker the lead. */
export function countLeadLanes(gestures: readonly { BidderAddr?: string | null }[]): number {
  const makers = new Set<string>();
  for (const gesture of gestures) {
    const address = gesture.BidderAddr?.toLowerCase();
    if (address) makers.add(address);
  }
  return makers.size;
}

async function readCount(cycle: number): Promise<number> {
  return countLeadLanes(await get_bid_list_by_round(cycle, 'asc'));
}

/*
 * The API has no per-cycle count of makers, so the count comes from the
 * cycle's gesture list (about 1 MB of JSON for a long cycle). Only the number
 * is cached, across requests and locales: a finalized cycle's count never
 * changes, so it is kept until the next deploy; the live cycle's is kept for a
 * minute. A failed read throws out of the cache, so it is never stored.
 */
const finalizedLanes = unstable_cache(readCount, ['embed-lead-lanes', 'final']);
const liveLanes = unstable_cache(readCount, ['embed-lead-lanes', 'live'], {
  revalidate: LIVE_LANES_SECONDS,
});

/**
 * How many addresses held the lead in `cycle`, to size the chart's loading
 * lanes so the window keeps its height when they arrive. `liveCycle` is the
 * dashboard's live cycle (undefined when it could not be read, which is
 * treated as live: the short-lived cache). Undefined when the list fails.
 */
export async function readLeadLaneCount(
  cycle: number,
  liveCycle: number | undefined,
): Promise<number | undefined> {
  const finalized = liveCycle !== undefined && cycle < liveCycle;
  try {
    return await (finalized ? finalizedLanes(cycle) : liveLanes(cycle));
  } catch {
    return undefined;
  }
}
