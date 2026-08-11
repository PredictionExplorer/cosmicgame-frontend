'use client';

import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import {
  startCosmicEventPolling,
  type CosmicChainEvent,
  type WatchedCosmicEventName,
} from '@/lib/chainEvents';

export const LIVE_GAME_QUERY_KEYS: readonly (readonly unknown[])[] = [
  ['dashboardInfo'],
  ['currentSpecialWinners'],
  ['specialAllocationChainSnapshot'],
  ['allocationTime'],
  ['timeUntilPrize'],
  ['currentTime'],
  ['gestureList'],
  ['bidListByRound'],
  ['donationsNFTByRound'],
  ['donationsERC20ByRound'],
  ['bidEthPrice'],
  ['ctPrice'],
];

/** Queries showing ETH donation data (list pages, per-round tabs, totals). */
const ETH_DONATION_QUERY_KEYS: readonly (readonly unknown[])[] = [
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

/**
 * The backend ETL indexes a new block shortly after the node sees it, so the
 * immediate invalidation can still fetch pre-event API data. Each affected
 * query is therefore invalidated a second time after this delay.
 */
export const ETL_ECHO_DELAY_MS = 2_000;

export function invalidateLiveGameQueries(queryClient: QueryClient): Promise<unknown[]> {
  return Promise.all(
    LIVE_GAME_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
      }),
    ),
  );
}

/**
 * Site-wide event-driven refresh: polls both RPC nodes for the watched
 * CosmicGame events (see lib/chainEvents) and, when one lands on-chain,
 * broadcasts the matching window event and invalidates the affected query
 * caches — once immediately and once after `ETL_ECHO_DELAY_MS`, so viewers
 * see fresh data even though the backend ETL indexes the block slightly
 * after the node does.
 */
export function useLiveGameDataRefresh() {
  const queryClient = useQueryClient();
  const { cosmicGame } = useContractAddresses();

  useEffect(() => {
    if (!cosmicGame) return undefined;

    const echoTimers = new Set<ReturnType<typeof setTimeout>>();

    const handleEvents = (events: CosmicChainEvent[]): void => {
      const keysByHash = new Map<string, readonly unknown[]>();
      const windowEventNames = new Set<string>();
      for (const event of events) {
        for (const queryKey of EVENT_QUERY_ROUTES[event.eventName]) {
          keysByHash.set(JSON.stringify(queryKey), queryKey);
        }
        const windowEventName = EVENT_WINDOW_EVENTS[event.eventName];
        if (windowEventName) windowEventNames.add(windowEventName);
      }

      for (const name of windowEventNames) {
        window.dispatchEvent(new CustomEvent(name));
      }

      const invalidateAll = (): void => {
        for (const queryKey of keysByHash.values()) {
          void queryClient.invalidateQueries({ queryKey });
        }
      };
      invalidateAll();
      const timer = setTimeout(() => {
        echoTimers.delete(timer);
        invalidateAll();
      }, ETL_ECHO_DELAY_MS);
      echoTimers.add(timer);
    };

    const stop = startCosmicEventPolling({
      contractAddress: cosmicGame,
      onEvents: handleEvents,
    });

    return () => {
      stop();
      for (const timer of echoTimers) clearTimeout(timer);
    };
  }, [cosmicGame, queryClient]);
}
