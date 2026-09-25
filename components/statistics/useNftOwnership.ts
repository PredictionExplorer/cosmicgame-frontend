'use client';

import { useMemo } from 'react';

import {
  useCSTDistribution,
  useDashboardInfo,
  useUniqueCSTAnchorHolders,
} from '@/hooks/useApiQuery';
import type { TokenDistribution, UniqueAnchorHolderCST } from '@/services/api/types';

import { nftOwnership, type NftOwnership } from './nftOwnership';

export interface NftOwnershipQuery {
  /** Null until all three reads have answered, or when one failed. */
  data: NftOwnership | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * The Cosmic Signature NFT holders as the tokens page counts them
 * (`nftOwnership`): the NFT distribution, the anchor-holders, and the
 * Anchoring Wallet's address from the dashboard. The header's holder count
 * and the ledger read this one hook, so they always agree.
 */
export function useNftOwnership(): NftOwnershipQuery {
  const distribution = useCSTDistribution();
  const anchorHolders = useUniqueCSTAnchorHolders();
  const dashboard = useDashboardInfo(undefined, { poll: false });
  const custody = dashboard.data?.ContractAddrs?.StakingWalletCSTAddr;

  const data = useMemo(
    () =>
      distribution.data && anchorHolders.data && custody
        ? nftOwnership(
            distribution.data as TokenDistribution[],
            anchorHolders.data as UniqueAnchorHolderCST[],
            custody,
          )
        : null,
    [distribution.data, anchorHolders.data, custody],
  );

  const isLoading = distribution.isLoading || anchorHolders.isLoading || dashboard.isLoading;
  return {
    data,
    isLoading,
    isError: !isLoading && data === null,
    refetch: () => {
      if (distribution.isError) void distribution.refetch();
      if (anchorHolders.isError) void anchorHolders.refetch();
      if (dashboard.isError || !custody) void dashboard.refetch();
    },
  };
}
