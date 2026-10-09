'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { isAddress, parseAbi } from 'viem';

import { ethDistributionFacts, isV3Mechanics, protocolFacts } from '@/content/protocol-facts';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { isMissingFunctionReadError } from '@/utils/cosmicGameContractCompat';
import { isTransientNetworkError, reportError, reportErrorThrottled } from '@/utils/errors';
import { useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';

/**
 * The ETH allocation split and the Signature Allocation's NFT count, read
 * from the Game contract itself instead of hard-coded copy. The owner can
 * retune every one of these with a setter, so the live surfaces must follow
 * the chain; `content/protocol-facts.ts` remains the static fallback (and
 * the source for server-rendered copy, which `scripts/audit-protocol-facts.ts`
 * audits against the chain).
 */
export interface LiveAllocationFacts {
  mainEthPercentage: number;
  chronoWarriorEthPercentage: number;
  stellarSelectionEthPercentage: number;
  anchorDistributionPercentage: number;
  publicGoodsPercentage: number;
  /** Cosmic Signature NFTs in the Signature Allocation (V3's `mainPrizeNumCosmicSignatureNfts()`; 1 before V3). */
  signatureNftCount: number;
  /** True when every figure above came from the contract. */
  live: boolean;
}

/** The version-appropriate static figures, served until (or instead of) a chain read. */
const STATIC_FACTS: LiveAllocationFacts = {
  mainEthPercentage: ethDistributionFacts.mainEthPercentage,
  chronoWarriorEthPercentage: ethDistributionFacts.chronoWarriorEthPercentage,
  stellarSelectionEthPercentage: ethDistributionFacts.stellarSelectionEthPercentage,
  anchorDistributionPercentage: ethDistributionFacts.anchorDistributionPercentage,
  publicGoodsPercentage: ethDistributionFacts.publicGoodsPercentage,
  signatureNftCount: isV3Mechanics ? protocolFacts.v3.mainPrizeNftsPerCycleDefault : 1,
  live: false,
};

// lexicon-allow-start: verbatim on-chain ABI method names (sealed contract surface)
const allocationFactsAbi = parseAbi([
  'function mainEthPrizeAmountPercentage() view returns (uint256)',
  'function chronoWarriorEthPrizeAmountPercentage() view returns (uint256)',
  'function raffleTotalEthPrizeAmountForBiddersPercentage() view returns (uint256)',
  'function cosmicSignatureNftStakingTotalEthRewardAmountPercentage() view returns (uint256)',
  'function charityEthDonationAmountPercentage() view returns (uint256)',
  'function mainPrizeNumCosmicSignatureNfts() view returns (uint256)',
]);
// lexicon-allow-end

type AllocationFactsFunctionName = (typeof allocationFactsAbi)[number]['name'];

/** Owner retunes are rare; a 5-minute cadence follows them soon enough. */
const FACTS_REFRESH_MS = 5 * 60_000;

/**
 * The live allocation facts, or the static fallback while the chain read is
 * unavailable (no RPC, UX scenario, or a read failure). Always defined.
 */
export function useLiveAllocationFacts(): LiveAllocationFacts {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();
  const uxScenario = useUxScenarioSnapshot();
  const enabled = !uxScenario && !!publicClient && isAddress(cosmicGame);

  const { data } = useQuery<LiveAllocationFacts>({
    queryKey: ['liveAllocationFacts', activeChain.id, cosmicGame],
    enabled,
    staleTime: FACTS_REFRESH_MS,
    refetchInterval: FACTS_REFRESH_MS,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const read = (functionName: AllocationFactsFunctionName) =>
        publicClient!.readContract({
          address: cosmicGame as `0x${string}`,
          abi: allocationFactsAbi,
          functionName,
        });
      try {
        const [main, chrono, stellar, anchor, publicGoods] = await Promise.all([
          read('mainEthPrizeAmountPercentage'), // lexicon-allow-abi
          read('chronoWarriorEthPrizeAmountPercentage'), // lexicon-allow-abi
          read('raffleTotalEthPrizeAmountForBiddersPercentage'), // lexicon-allow-abi
          read('cosmicSignatureNftStakingTotalEthRewardAmountPercentage'),
          read('charityEthDonationAmountPercentage'), // lexicon-allow-abi
        ]);
        // V3 only; V2 keeps the single Signature Allocation NFT.
        const nftCount = await read('mainPrizeNumCosmicSignatureNfts') // lexicon-allow-abi
          .then((value) => Number(value))
          .catch((err) => {
            if (isMissingFunctionReadError(err)) return 1;
            throw err;
          });
        return {
          mainEthPercentage: Number(main),
          chronoWarriorEthPercentage: Number(chrono),
          stellarSelectionEthPercentage: Number(stellar),
          anchorDistributionPercentage: Number(anchor),
          publicGoodsPercentage: Number(publicGoods),
          signatureNftCount: nftCount,
          live: true,
        };
      } catch (err) {
        if (isTransientNetworkError(err)) reportErrorThrottled(err, 'live allocation facts');
        else reportError(err, 'live allocation facts');
        throw err;
      }
    },
  });

  return data ?? STATIC_FACTS;
}
