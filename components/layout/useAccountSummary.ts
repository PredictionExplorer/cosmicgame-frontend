'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';

import { HEADER_POLL_INTERVAL_MS } from '@/config/constants';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
import { useApiData } from '@/contexts/ApiDataContext';
import { useUserBalance } from '@/hooks/useApiQuery';
import useCosmicSignatureContract from '@/hooks/useCosmicSignatureContract';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';

export interface AccountBalances {
  ETH: number;
  CosmicToken: number;
  /** Cosmic Signature NFTs the wallet holds now (balanceOf), not ever received. */
  CosmicSignature: number;
  RWLK: number;
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

function toWeiNumber(value: unknown): number {
  try {
    return Number(formatEther(BigInt(String(value))));
  } catch {
    return 0;
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
  const { data: rwlkCount } = useQuery({
    queryKey: ['header', 'rwlkNftBalance', owner],
    queryFn: async () => (rwlkBalanceOf && owner ? Number(await rwlkBalanceOf([owner])) : 0),
    enabled: !!owner && !!rwlkBalanceOf,
    refetchInterval: HEADER_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  return useMemo(() => {
    const retrievableEth = (status?.ETHRaffleToClaim ?? 0) > 0 ? status!.ETHRaffleToClaim! : null;
    const hasRetrievable = !!(
      account &&
      (retrievableEth !== null ||
        (status?.NumDonatedNFTToClaim ?? 0) > 0 ||
        ((status?.UnretrievedAnchorDistribution ?? 0) > 0 &&
          (status?.claimableActionIds?.length ?? 0) > 0))
    );
    return {
      account: account ?? null,
      balance: {
        ETH: userBalance ? toWeiNumber(userBalance.ETH_Balance) : 0,
        CosmicToken: userBalance ? toWeiNumber(userBalance.CosmicTokenBalance) : 0,
        CosmicSignature: csCount ?? 0,
        RWLK: rwlkCount ?? 0,
      },
      loading: !!account && (isLoadingBalance || isLoadingCs),
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
    cstokens,
    rwlktokens,
  ]);
}
