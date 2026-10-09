'use client';

import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { usePublicClient } from 'wagmi';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import { RWLK_ANCHORABLE_QUERY_KEY, readAnchorableRandomWalkIds } from './randomWalkAnchorable';

/**
 * The connected wallet's Random Walk NFTs that can still be anchored, read
 * from the chain (see `readAnchorableRandomWalkIds`). Keyed by account, so a
 * switched wallet never shows the previous one's NFTs; `isError` and
 * `refetch` let the page show a failed read as an error with a retry, never
 * as an empty wallet. Anchoring invalidates it (`useAnchorActions`).
 */
export function useRandomWalkAnchorable(account: string | null | undefined) {
  const client = usePublicClient();
  const { randomWalkNft, stakingRwalk } = useContractAddresses();
  return useQuery({
    queryKey: [RWLK_ANCHORABLE_QUERY_KEY, account],
    queryFn: () =>
      readAnchorableRandomWalkIds(client!, {
        account: account as Address,
        nft: randomWalkNft as Address,
        anchoring: stakingRwalk as Address,
      }),
    enabled: Boolean(account && client && randomWalkNft && stakingRwalk),
    staleTime: 15_000,
  });
}
