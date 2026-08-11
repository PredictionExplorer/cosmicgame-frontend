'use client';

import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { cosmicGameAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { reportError } from '@/utils/errors';

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
 * Watcher failures repeat on every poll cycle (~4s) while an RPC node is
 * unreachable; report each label at most once per window to keep Sentry
 * signal without flooding it.
 */
const WATCH_ERROR_REPORT_INTERVAL_MS = 5 * 60_000;
const lastWatchErrorReportAtMs = new Map<string, number>();

function reportWatchError(error: unknown, label: string): void {
  const now = Date.now();
  if (now - (lastWatchErrorReportAtMs.get(label) ?? 0) < WATCH_ERROR_REPORT_INTERVAL_MS) return;
  lastWatchErrorReportAtMs.set(label, now);
  reportError(error, label);
}

/**
 * Keeps active-cycle UI synchronized for passive viewers: refreshes live data
 * the moment a new gesture lands on-chain and the moment a cycle is finalized
 * (`MainPrizeClaimed`), instead of waiting for the next scheduled poll.
 */
export function useLiveGameDataRefresh() {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();

  useEffect(() => {
    if (!publicClient || !cosmicGame) return undefined;

    const address = cosmicGame as `0x${string}`;
    const unwatchers: (() => void)[] = [];
    try {
      unwatchers.push(
        publicClient.watchContractEvent({
          address,
          abi: cosmicGameAbi,
          eventName: 'BidPlaced',
          onLogs: () => {
            window.dispatchEvent(new CustomEvent('cosmic:gesture-placed'));
            void invalidateLiveGameQueries(queryClient);
          },
          onError: (error) => reportWatchError(error, 'watch BidPlaced'),
        }),
      );
      unwatchers.push(
        publicClient.watchContractEvent({
          address,
          abi: cosmicGameAbi,
          eventName: 'MainPrizeClaimed',
          onLogs: () => {
            window.dispatchEvent(new CustomEvent('cosmic:cycle-finalized'));
            void invalidateLiveGameQueries(queryClient);
            void queryClient.invalidateQueries({ queryKey: ['claimHistory'] });
            void queryClient.invalidateQueries({ queryKey: ['roundList'] });
          },
          onError: (error) => reportWatchError(error, 'watch MainPrizeClaimed'),
        }),
      );
    } catch (error) {
      reportError(error, 'watch cosmic game events');
    }
    return () => {
      for (const unwatch of unwatchers) unwatch();
    };
  }, [cosmicGame, publicClient, queryClient]);
}
