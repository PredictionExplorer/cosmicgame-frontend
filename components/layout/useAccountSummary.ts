'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';

import { HEADER_POLL_INTERVAL_MS } from '@/config/constants';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
import { useApiData } from '@/contexts/ApiDataContext';
import { summarizePendingRetrievals } from '@/lib/pendingRetrievals';
import { useUserBalance } from '@/hooks/useApiQuery';
import useCosmicSignatureContract from '@/hooks/useCosmicSignatureContract';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';

/**
 * The wallet's balances. `null` is a figure that could not be read (the API or
 * a balanceOf call failed, or has not answered yet): the menu shows it as
 * unavailable, never as 0.
 */
export interface AccountBalances {
  ETH: number | null;
  CosmicToken: number | null;
  /** Cosmic Signature NFTs the wallet holds now (balanceOf), not ever received. */
  CosmicSignature: number | null;
  RWLK: number | null;
}

export interface AccountSummary {
  account: string | null;
  balance: AccountBalances;
  loading: boolean;
  anchored: { cst?: number; rwalk?: number };
  /** Something waits in My Allocations: ETH, attached NFTs or releasable distributions. */
  hasRetrievable: boolean;
  /** The ETH part of it, when there is one (for the "0.0123 ETH ready" label). */
  retrievableEth: number | null;
}

/** A wei amount from the API in ether, or null when the field is missing or malformed. */
export function weiToEther(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  try {
    return Number(formatEther(BigInt(String(value))));
  } catch {
    return null;
  }
}

/**
 * The connected wallet as the header shows it: balances, anchored NFTs and
 * whether anything waits to be retrieved. Owned NFT counts come from the
 * contracts' balanceOf, polled with the header cadence.
 */
export function useAccountSummary(): AccountSummary {
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();
  const csContract = useCosmicSignatureContract();
  const rwlkContract = useRWLKNFTContract();
  const { data: userBalance, isLoading: isLoadingBalance } = useUserBalance(account);
  const { cstokens, rwlktokens } = useAnchoredToken();

  const owner = account as `0x${string}` | null;
  const csBalanceOf = csContract?.read.balanceOf;
  const rwlkBalanceOf = rwlkContract?.read.balanceOf;
  const { data: csCount, isLoading: isLoadingCs } = useQuery({
    queryKey: ['header', 'csNftBalance', owner],
    queryFn: async () => (csBalanceOf && owner ? Number(await csBalanceOf([owner])) : 0),
    enabled: !!owner && !!csBalanceOf,
    refetchInterval: HEADER_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
  const { data: rwlkCount, isLoading: isLoadingRwlk } = useQuery({
    queryKey: ['header', 'rwlkNftBalance', owner],
    queryFn: async () => (rwlkBalanceOf && owner ? Number(await rwlkBalanceOf([owner])) : 0),
    enabled: !!owner && !!rwlkBalanceOf,
    refetchInterval: HEADER_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  return useMemo(() => {
    // The one retrieval rule the home's standing also reads (F157).
    const pending = summarizePendingRetrievals(status);
    const retrievableEth = pending.eth > 0 ? pending.eth : null;
    const hasRetrievable = !!account && pending.hasAny;
    return {
      account: account ?? null,
      balance: {
        ETH: userBalance ? weiToEther(userBalance.ETH_Balance) : null,
        CosmicToken: userBalance ? weiToEther(userBalance.CosmicTokenBalance) : null,
        CosmicSignature: csCount ?? null,
        RWLK: rwlkCount ?? null,
      },
      loading: !!account && (isLoadingBalance || isLoadingCs || isLoadingRwlk),
      anchored: { cst: cstokens?.length, rwalk: rwlktokens?.length },
      hasRetrievable,
      retrievableEth: account ? retrievableEth : null,
    };
  }, [
    account,
    status,
    userBalance,
    csCount,
    rwlkCount,
    isLoadingBalance,
    isLoadingCs,
    isLoadingRwlk,
    cstokens,
    rwlktokens,
  ]);
}
