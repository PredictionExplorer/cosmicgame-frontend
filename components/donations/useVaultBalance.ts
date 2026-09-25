'use client';

import { useQuery } from '@tanstack/react-query';
import { formatEther, isAddress, type Address } from 'viem';
import { usePublicClient } from 'wagmi';

import { activeChain } from '@/config/chains';
import { toFiniteNumber } from '@/utils/finiteNumber';

/** The query key prefix of the Public Goods Vault's on-chain balance, for invalidation. */
export const VAULT_BALANCE_QUERY_KEY = 'publicGoodsVaultBalance';

/**
 * The Public Goods Vault's ETH balance, read from the chain (never the
 * indexer, which lags a forward by a block or more). Whether a forward is
 * worth offering depends on it: after a confirmed forward, or one someone
 * else just made, the indexer can still report ETH that is no longer there.
 */
export function useVaultBalance(vault: string | null | undefined) {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const enabled = Boolean(publicClient && vault && isAddress(vault));
  const query = useQuery({
    queryKey: [VAULT_BALANCE_QUERY_KEY, vault],
    queryFn: () => publicClient!.getBalance({ address: vault as Address }),
    enabled,
    staleTime: 15_000,
  });
  return { query, enabled };
}

/**
 * The vault balance in ETH to show and act on: the chain's reading when it
 * answers; the dashboard's figure while the chain cannot (no client, or the
 * read failed); `undefined` while the chain is being read. `null` when
 * neither is known.
 */
export function vaultBalanceEth(
  chain: ReturnType<typeof useVaultBalance>,
  dashboardEth: number | null | undefined,
): number | null | undefined {
  if (chain.query.data !== undefined) return Number(formatEther(chain.query.data));
  if (chain.enabled && chain.query.isPending) return undefined;
  return dashboardEth === undefined ? undefined : toFiniteNumber(dashboardEth);
}
