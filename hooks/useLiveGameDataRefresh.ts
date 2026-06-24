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

/** Keeps active-cycle UI synchronized for passive viewers when a new gesture lands on-chain. */
export function useLiveGameDataRefresh() {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();

  useEffect(() => {
    if (!publicClient || !cosmicGame) return undefined;

    try {
      return publicClient.watchContractEvent({
        address: cosmicGame as `0x${string}`,
        abi: cosmicGameAbi,
        eventName: 'BidPlaced',
        onLogs: () => {
          window.dispatchEvent(new CustomEvent('cosmic:gesture-placed'));
          void invalidateLiveGameQueries(queryClient);
        },
      });
    } catch (error) {
      reportError(error, 'watch BidPlaced');
      return undefined;
    }
  }, [cosmicGame, publicClient, queryClient]);
}
