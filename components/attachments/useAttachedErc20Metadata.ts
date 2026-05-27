import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import ERC20_ABI from '@/contracts/CosmicToken.json';

import { activeChain } from '@/config/chains';

export interface AttachedErc20Metadata {
  name?: string;
  symbol?: string;
  decimals: number;
  logoURI?: string;
  logoSource?: string;
}

async function fetchAttachedErc20Logo(
  tokenAddress: string,
  chainId: number,
): Promise<Pick<AttachedErc20Metadata, 'logoURI' | 'logoSource'>> {
  const params = new URLSearchParams({
    address: tokenAddress,
    chainId: String(chainId),
  });
  const response = await fetch(`/api/token-metadata?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return {};

  const data = (await response.json()) as { logoURI?: unknown; source?: unknown } | null;
  return typeof data?.logoURI === 'string'
    ? {
        logoURI: data.logoURI,
        logoSource: typeof data.source === 'string' ? data.source : undefined,
      }
    : {};
}

/** Reads display metadata for an attached ERC-20 token, with graceful fallbacks for minimal contracts. */
export function useAttachedErc20Metadata(tokenAddress: string | null | undefined) {
  const publicClient = usePublicClient();
  const normalizedAddress =
    typeof tokenAddress === 'string' && isAddress(tokenAddress) ? tokenAddress.toLowerCase() : null;

  return useQuery<AttachedErc20Metadata | null>({
    queryKey: ['attachedErc20Metadata', activeChain.id, normalizedAddress],
    enabled: Boolean(normalizedAddress),
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      if (!normalizedAddress) return null;
      const address = normalizedAddress as `0x${string}`;

      const [symbolResult, decimalsResult, nameResult, logoResult] = await Promise.allSettled([
        publicClient
          ? publicClient.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'symbol',
            })
          : Promise.resolve(undefined),
        publicClient
          ? publicClient.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'decimals',
            })
          : Promise.resolve(undefined),
        publicClient
          ? publicClient.readContract({
              address,
              abi: ERC20_ABI,
              functionName: 'name',
            })
          : Promise.resolve(undefined),
        fetchAttachedErc20Logo(normalizedAddress, activeChain.id),
      ]);
      const logo = logoResult.status === 'fulfilled' ? logoResult.value : {};

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
        ...logo,
      };
    },
  });
}
