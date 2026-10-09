'use client';

import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { usePublicClient } from 'wagmi';

import { cosmicTokenAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

/** CST is an 18-decimal ERC-20, like ETH: amounts are read and typed in whole tokens. */
export const CST_DECIMALS = 18;

/** The query key prefix of every CST balance read, for invalidation after a transfer. */
export const CST_BALANCE_QUERY_KEY = 'cstBalance';

/**
 * An address's CST balance in base units, read from the token contract on
 * the protocol's chain (never from the indexer, which can lag a transfer by
 * a block or two). `data` is undefined while loading; `isError` when the
 * read failed, so a form can say so instead of offering a balance of 0.
 */
export function useCstBalance(owner: Address | null) {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicToken } = useContractAddresses();
  return useQuery({
    queryKey: [CST_BALANCE_QUERY_KEY, cosmicToken, owner],
    queryFn: async () =>
      (await publicClient!.readContract({
        address: cosmicToken as Address,
        abi: cosmicTokenAbi,
        functionName: 'balanceOf',
        args: [owner!],
      })) as bigint,
    enabled: Boolean(owner && cosmicToken && publicClient),
    staleTime: 15_000,
  });
}
