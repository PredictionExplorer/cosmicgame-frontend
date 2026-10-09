'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { isAddress, parseAbi, type PublicClient } from 'viem';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { isMissingFunctionReadError } from '@/utils/cosmicGameContractCompat';
import { isTransientNetworkError, reportError, reportErrorThrottled } from '@/utils/errors';
import { useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';
import {
  buildSelectionPool,
  type SelectionPool,
  type SelectionPoolEntry,
} from '@/lib/selectionWeights';

/**
 * The live cycle's weighted Stellar Selection pool, read from the Game
 * contract itself (the indexer does not carry gesture weights).
 *
 * `data` resolves to:
 *   - a {@link SelectionPool} on a V3 deployment whose cycle carries weights;
 *   - null on V2 deployments (the getters do not exist), on cycles finished
 *     before the V3 upgrade (every stored weight reads 0), and while the
 *     cycle has no gestures. Callers then keep the count-based share — the
 *     formula those cycles actually select by.
 *
 * Gestures are immutable once placed, so each (cycle, index) reading is
 * cached for the session and a refresh only fetches the indices added since.
 */

// lexicon-allow-start: verbatim on-chain ABI method and member names (sealed contract surface)
const selectionPoolAbi = parseAbi([
  'function roundStats(uint256 roundNum) view returns (uint256 numBids, uint256 numCstBids, uint256 totalSpentEthAmount, uint256 totalSpentCstAmount, uint256 maxEthBidPrice, uint256 maxCstBidPrice, uint256 enduranceChampionDuration, uint256 chronoWarriorDuration, uint256 flags)',
  'function getBidInfoAt(uint256 roundNum_, uint256 bidIndex_) view returns ((address bidderAddress, uint256 raffleCumulativeWeight))',
]);
// lexicon-allow-end

/** How many per-gesture readings travel in one parallel batch. */
const ENTRY_BATCH_SIZE = 40;

/** Refresh cadence while the deployment answers the V3 getters. */
const POOL_REFRESH_MS = 15_000;

/**
 * Session cache of immutable per-gesture readings, keyed by
 * `chainId:gameAddress:cycle`. Entries only ever get appended.
 */
const entryCache = new Map<string, SelectionPoolEntry[]>();

/** The query's resolved shape; `legacy` stops further polling on V2. */
interface SelectionPoolResult {
  pool: SelectionPool | null;
  /** True when the deployment does not implement the V3 getters. */
  legacy: boolean;
}

async function readSelectionPool(
  client: PublicClient,
  gameAddress: `0x${string}`,
  cycle: number,
): Promise<SelectionPoolResult> {
  let numGestures: number;
  try {
    const stats = await client.readContract({
      address: gameAddress,
      abi: selectionPoolAbi,
      functionName: 'roundStats', // lexicon-allow-abi
      args: [BigInt(cycle)],
    });
    numGestures = Number(stats[0]);
  } catch (err) {
    if (isMissingFunctionReadError(err)) return { pool: null, legacy: true };
    throw err;
  }
  if (!Number.isFinite(numGestures) || numGestures <= 0) return { pool: null, legacy: false };

  const cacheKey = `${client.chain?.id ?? 0}:${gameAddress.toLowerCase()}:${cycle}`;
  const cached = entryCache.get(cacheKey) ?? [];
  const entries = cached.slice(0, Math.min(cached.length, numGestures));
  for (let from = entries.length; from < numGestures; from += ENTRY_BATCH_SIZE) {
    const to = Math.min(from + ENTRY_BATCH_SIZE, numGestures);
    const batch = await Promise.all(
      Array.from({ length: to - from }, (_, offset) =>
        client.readContract({
          address: gameAddress,
          abi: selectionPoolAbi,
          functionName: 'getBidInfoAt', // lexicon-allow-abi
          args: [BigInt(cycle), BigInt(from + offset)],
        }),
      ),
    );
    for (const info of batch) {
      entries.push({
        gesturerAddress: info.bidderAddress, // lexicon-allow-abi
        cumulativeWeight: info.raffleCumulativeWeight, // lexicon-allow-abi
      });
    }
  }
  entryCache.set(cacheKey, entries);
  return { pool: buildSelectionPool(cycle, entries), legacy: false };
}

/**
 * The weighted Stellar Selection pool of the given cycle, or null wherever
 * the count-based share is the right one (see the module comment).
 */
export function useSelectionPool(cycle: number | null | undefined) {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();
  const uxScenario = useUxScenarioSnapshot();
  const enabled =
    !uxScenario &&
    !!publicClient &&
    isAddress(cosmicGame) &&
    cycle != null &&
    Number.isFinite(cycle) &&
    cycle >= 0;

  const query = useQuery<SelectionPoolResult>({
    queryKey: ['selectionPool', activeChain.id, cosmicGame, cycle],
    enabled,
    queryFn: async () => {
      try {
        return await readSelectionPool(publicClient!, cosmicGame as `0x${string}`, cycle!);
      } catch (err) {
        // A transient transport blip recovers on the next poll; the callers
        // keep the count-based share meanwhile.
        if (isTransientNetworkError(err)) reportErrorThrottled(err, 'selection pool weights');
        else reportError(err, 'selection pool weights');
        throw err;
      }
    },
    staleTime: POOL_REFRESH_MS,
    refetchInterval: (q) => (q.state.data?.legacy ? false : POOL_REFRESH_MS),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  return { ...query, data: query.data?.pool ?? null };
}
