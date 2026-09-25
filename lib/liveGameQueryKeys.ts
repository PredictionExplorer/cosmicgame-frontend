import type { WatchedCosmicEventName } from '@/lib/chainEvents';

/*
 * Which query caches the chain-event refresh (hooks/useLiveGameDataRefresh)
 * keeps fresh. Plain data, apart from the event polling itself, so the app
 * shell can tell whether a page shows live data without loading the ABIs
 * and the RPC client that watch the chain.
 */

export const LIVE_GAME_QUERY_KEYS: readonly (readonly unknown[])[] = [
  ['dashboardInfo'],
  ['currentSpecialWinners'],
  ['specialAllocationChainSnapshot'],
  ['allocationTime'],
  ['timeUntilPrize'],
  ['currentTime'],
  ['gestureList'],
  ['bidListByRound'],
  ['homeGestureFeed'],
  ['donationsNFTByRound'],
  ['donationsERC20ByRound'],
  ['bidEthPrice'],
  ['ctPrice'],
];

/** Queries showing ETH donation data (list pages, per-round tabs, totals). */
export const ETH_DONATION_QUERY_KEYS: readonly (readonly unknown[])[] = [
  ['dashboardInfo'],
  ['donationsCGSimpleList'],
  ['donationsCGSimpleByRound'],
  ['donationsCGWithInfoList'],
  ['donationsCGWithInfoByRound'],
  ['donationsWithInfoById'],
  ['donationsEthByUser'],
  ['donationsBoth'],
  ['donationsBothByRound'],
];

/**
 * Which query caches each watched CosmicGame event refreshes. Keys are
 * matched as prefixes, so e.g. `['roundInfo']` covers every per-round entry.
 */
export const EVENT_QUERY_ROUTES: Record<WatchedCosmicEventName, readonly (readonly unknown[])[]> = {
  BidPlaced: LIVE_GAME_QUERY_KEYS,
  FirstBidPlacedInRound: [...LIVE_GAME_QUERY_KEYS, ['roundList'], ['roundInfo']],
  MainPrizeClaimed: [...LIVE_GAME_QUERY_KEYS, ['claimHistory'], ['roundList'], ['roundInfo']],
  EthDonated: ETH_DONATION_QUERY_KEYS,
  EthDonatedWithInfo: ETH_DONATION_QUERY_KEYS,
};

/** DOM events broadcast so non-query consumers can react immediately. */
export const EVENT_WINDOW_EVENTS: Partial<Record<WatchedCosmicEventName, string>> = {
  BidPlaced: 'cosmic:gesture-placed',
  FirstBidPlacedInRound: 'cosmic:gesture-placed',
  MainPrizeClaimed: 'cosmic:cycle-finalized',
};

/** The first element of every key the refresh invalidates. */
const REFRESHED_KEY_ROOTS: ReadonlySet<unknown> = new Set(
  Object.values(EVENT_QUERY_ROUTES).flatMap((keys) => keys.map((key) => key[0])),
);

/** Whether a chain event would refresh this query (a prefix match on its first element). */
export function isLiveGameQueryKey(queryKey: readonly unknown[]): boolean {
  return REFRESHED_KEY_ROOTS.has(queryKey[0]);
}
