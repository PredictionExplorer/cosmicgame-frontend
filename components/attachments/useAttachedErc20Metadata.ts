import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import ERC20_ABI from '@/contracts/CosmicToken.json';

export interface AttachedErc20Metadata {
  name?: string;
  symbol?: string;
  decimals: number;
}

/** Reads display metadata for an attached ERC-20 token, with graceful fallbacks for minimal contracts. */
export function useAttachedErc20Metadata(tokenAddress: string | null | undefined) {
  const publicClient = usePublicClient();
  const normalizedAddress =
    typeof tokenAddress === 'string' && isAddress(tokenAddress) ? tokenAddress.toLowerCase() : null;

  return useQuery<AttachedErc20Metadata | null>({
    queryKey: ['attachedErc20Metadata', normalizedAddress],
    enabled: Boolean(publicClient && normalizedAddress),
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      if (!publicClient || !normalizedAddress) return null;
      const address = normalizedAddress as `0x${string}`;

      const [symbolResult, decimalsResult, nameResult] = await Promise.allSettled([
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          address,
          abi: ERC20_ABI,
          functionName: 'name',
        }),
      ]);

      return {
        symbol:
          symbolResult.status === 'fulfilled' && typeof symbolResult.value === 'string'
            ? symbolResult.value
            : undefined,
        decimals:
          decimalsResult.status === 'fulfilled' && Number.isFinite(Number(decimalsResult.value))
            ? Number(decimalsResult.value)
            : 18,
        name:
          nameResult.status === 'fulfilled' && typeof nameResult.value === 'string'
            ? nameResult.value
            : undefined,
      };
    },
  });
}
