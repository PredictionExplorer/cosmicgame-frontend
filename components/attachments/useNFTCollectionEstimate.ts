import { useQuery } from '@tanstack/react-query';

import { networkConfig } from '@/config/networks';

export interface NFTCollectionEstimate {
  floorPriceEth: number;
  currency: string;
  source: string;
  sourceUrl?: string;
  updatedAt: string;
  confidence: 'collection-floor';
}

export function useNFTCollectionEstimate({
  tokenAddr,
  tokenId,
  enabled = true,
}: {
  tokenAddr?: string | null;
  tokenId?: string | number | null;
  enabled?: boolean;
}) {
  const contract = typeof tokenAddr === 'string' ? tokenAddr.trim() : '';
  const id = tokenId == null ? '' : String(tokenId).trim();

  return useQuery<NFTCollectionEstimate | null>({
    queryKey: ['nftCollectionEstimate', networkConfig.chainId, contract, id],
    queryFn: async () => {
      const params = new URLSearchParams({
        contract,
        chainId: String(networkConfig.chainId),
      });
      if (id) params.set('tokenId', id);

      const response = await fetch(`/api/nft-estimate?${params.toString()}`);
      if (!response.ok) return null;
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('floorPriceEth' in data)) return null;
      return data as NFTCollectionEstimate;
    },
    enabled: enabled && /^0x[a-fA-F0-9]{40}$/.test(contract),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
}
