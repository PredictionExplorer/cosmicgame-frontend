'use client';

import { useQuery } from '@tanstack/react-query';
import { isAddress, parseAbi, type Address } from 'viem';
import { usePublicClient } from 'wagmi';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

const ALLOCATION_PERCENTAGE_ABI = parseAbi([
  'function mainEthPrizeAmountPercentage() view returns (uint256)', // lexicon-allow-abi
]);

/**
 * Historical allocation percentages must not inherit today's configuration.
 * Read the state around the recorded finalization block. If the owner changed
 * the setting within that block, do not guess which value applied to the record.
 * Missing block data or an unavailable archive read leaves the share unknown.
 */
export function useHistoricalAllocationPercentage(
  finalizationBlock: number | undefined,
): number | null {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();
  const blockNumber =
    Number.isSafeInteger(finalizationBlock) && (finalizationBlock ?? 0) > 0
      ? BigInt(finalizationBlock!)
      : null;
  const enabled = Boolean(publicClient && isAddress(cosmicGame) && blockNumber !== null);
  const query = useQuery({
    queryKey: [
      'historicalAllocationPercentage',
      activeChain.id,
      cosmicGame,
      finalizationBlock ?? null,
    ],
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (!publicClient || blockNumber === null || !isAddress(cosmicGame)) {
        throw new Error('Historical allocation configuration unavailable');
      }
      const read = (atBlock: bigint) =>
        publicClient.readContract({
          address: cosmicGame as Address,
          abi: ALLOCATION_PERCENTAGE_ABI,
          functionName: 'mainEthPrizeAmountPercentage', // lexicon-allow-abi
          blockNumber: atBlock,
        });
      const [before, after] = await Promise.all([read(blockNumber - 1n), read(blockNumber)]);
      if (before !== after || after <= 0n || after > 100n) {
        throw new Error('Historical allocation configuration is ambiguous');
      }
      return Number(after);
    },
  });
  return enabled && !query.isError ? (query.data ?? null) : null;
}
