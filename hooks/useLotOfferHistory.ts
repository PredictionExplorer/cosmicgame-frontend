import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { getAbiItem, type Address, type PublicClient } from 'viem';

import { cosmicSignatureArtAuctionAbi } from '@/contracts/generated';

import { useSalonAddress } from './useSalonContract';

/** The query key of one lot's offer history (read only while it is open). */
export const SALON_OFFER_HISTORY_QUERY_KEY = 'salonOfferHistory';

/** How often an open history is re-read, so a live contest can be watched (ms). */
const HISTORY_POLL_MS = 12_000;

/** One raw offer log, reduced to what the history shows. Exported for tests. */
export interface OfferLogEntry {
  patron: string;
  /** The offer's total (wei). */
  total: bigint;
  blockNumber: bigint;
  logIndex: number;
  txHash: string;
}

/** One past offer on a lot, as the history renders it. */
export interface LotOffer {
  /** The wallet that placed the offer. */
  patron: string;
  /** The offer's total (wei). */
  total: bigint;
  /** The raise over the offer before it, in percent; `null` for the first. */
  raisePercent: number | null;
  /** When the offer landed on chain (unix seconds); `0` when unknown. */
  placedAt: number;
  /** The offer's transaction hash. */
  txHash: string;
}

const offerPlacedEvent = getAbiItem({
  abi: cosmicSignatureArtAuctionAbi,
  name: 'AuctionBidPlaced', // lexicon-allow-abi
});

/**
 * Orders raw offer logs as the chain did (block, then log index) and derives
 * each offer's raise over its predecessor; the newest offer comes first, the
 * way a patron reads a contest. Exported for tests.
 */
export function offerRowsFromLogs(
  entries: readonly OfferLogEntry[],
  timeByBlock: ReadonlyMap<bigint, number>,
): LotOffer[] {
  const ordered = [...entries].sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) return a.blockNumber < b.blockNumber ? -1 : 1;
    return a.logIndex - b.logIndex;
  });
  const rows = ordered.map((entry, index): LotOffer => {
    const previous = index > 0 ? ordered[index - 1]!.total : null;
    return {
      patron: entry.patron,
      total: entry.total,
      raisePercent:
        previous !== null && previous > 0n
          ? Number(((entry.total - previous) * 10_000n) / previous) / 100
          : null,
      placedAt: timeByBlock.get(entry.blockNumber) ?? 0,
      txHash: entry.txHash,
    };
  });
  return rows.reverse();
}

/**
 * Every offer ever placed on one lot, read from the chain's event log (the
 * event indexes the token id, so this is a single filtered `eth_getLogs`),
 * then dated by its block. Rejects on any failure, so a read error is never
 * shown as "no offers".
 */
export async function readLotOffers(
  client: PublicClient,
  salon: Address,
  nftId: number,
): Promise<LotOffer[]> {
  const logs = await client.getLogs({
    address: salon,
    event: offerPlacedEvent,
    args: { nftId: BigInt(nftId) },
    fromBlock: 'earliest',
  });

  const entries: OfferLogEntry[] = logs.map((log) => ({
    patron: (log.args.bidder ?? '') as string, // lexicon-allow-abi
    total: (log.args.amount ?? 0n) as bigint,
    blockNumber: log.blockNumber ?? 0n,
    logIndex: log.logIndex ?? 0,
    txHash: log.transactionHash ?? '',
  }));

  const blockNumbers = [...new Set(entries.map((entry) => entry.blockNumber))];
  const blocks = await Promise.all(
    blockNumbers.map((blockNumber) => client.getBlock({ blockNumber })),
  );
  const timeByBlock = new Map(blocks.map((block) => [block.number, Number(block.timestamp)]));

  return offerRowsFromLogs(entries, timeByBlock);
}

/**
 * One lot's offer history, read when `enabled` (the patron opened it) and
 * re-read on the lots' own cadence while it stays open.
 */
export function useLotOfferHistory(nftId: number, enabled: boolean) {
  const { address: salon } = useSalonAddress();
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: [SALON_OFFER_HISTORY_QUERY_KEY, salon, nftId],
    enabled: enabled && !!salon && !!publicClient,
    refetchInterval: HISTORY_POLL_MS,
    staleTime: 5_000,
    queryFn: () => readLotOffers(publicClient!, salon as Address, nftId),
  });

  return {
    offers: query.data,
    isPending: query.isPending,
    isError: query.isError,
  };
}
