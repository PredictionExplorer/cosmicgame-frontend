import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import type { Address, PublicClient } from 'viem';

import { cosmicSignatureArtAuctionAbi } from '@/contracts/generated';

import { useSalonAddress } from './useSalonContract';

/** The query key of the salon's lots (invalidated after every salon write). */
export const SALON_LOTS_QUERY_KEY = 'salonLots';
/** The query key of a wallet's returned offers held by the salon. */
export const SALON_CREDIT_QUERY_KEY = 'salonCredit';
/** The query key of the salon's fixed terms. */
export const SALON_FACTS_QUERY_KEY = 'salonFacts';

/** How often the open lots are re-read from the chain (ms). */
const LOTS_POLL_MS = 12_000;

const ZERO_ADDRESS = `0x${'0'.repeat(40)}`;

/** One Signature on offer in the salon, read from the chain. */
export interface SalonLot {
  /** The Signature's token id. */
  nftId: number;
  /** The cycle whose finalization placed it in the salon. */
  cycle: number;
  /** When offers open (unix seconds). */
  opensAt: number;
  /**
   * When offers close (unix seconds). `0` until the first offer: the
   * closing clock starts with it, so a piece no one has offered on stays
   * open indefinitely.
   */
  closesAt: number;
  /** The leading patron, or `''` when no offer has been placed. */
  leadingPatron: string;
  /** The leading offer (wei); `0n` when none has been placed. */
  leadingOffer: bigint;
  /** The smallest total offer the contract accepts next (wei). */
  minimumNextOffer: bigint;
  /** The offers have been concluded: the piece awaits (or found) its recipient. */
  concluded: boolean;
  /** The recipient has retrieved the piece. */
  retrieved: boolean;
}

/** The lots of one cycle, newest cycle first. */
export interface SalonExhibit {
  cycle: number;
  lots: SalonLot[];
}

/** The salon's fixed terms, read once from the contract. */
export interface SalonFacts {
  /** Signatures placed in the salon at each cycle's finalization. */
  lotsPerCycle: number;
  /** Seconds between a cycle's finalization and its lots opening for offers. */
  openingDelaySeconds: number;
  /** Seconds a lot stays open after its first offer. */
  offerWindowSeconds: number;
  /** A late offer extends the close to leave at least this window (seconds). */
  closingExtensionSeconds: number;
  /** A new offer must raise the leading one by at least 1/divisor (rounded up). */
  minimumRaiseDivisor: number;
}

/** Batched `eth_call`s, in one multicall where the chain has one. */
async function readMany(
  client: PublicClient,
  calls: readonly {
    address: Address;
    abi: typeof cosmicSignatureArtAuctionAbi;
    functionName: string;
    args?: readonly unknown[];
  }[],
): Promise<readonly unknown[]> {
  if (calls.length === 0) return [];
  if (client.chain?.contracts?.multicall3) {
    return client.multicall({
      contracts: calls as never,
      allowFailure: false,
    }) as Promise<readonly unknown[]>;
  }
  return Promise.all(calls.map((call) => client.readContract(call as never)));
}

interface LotStateTuple {
  roundNum: bigint;
  eligibleAt: bigint;
  endAt: bigint;
  highestBidder: Address;
  highestBid: bigint;
  registered: boolean;
  settled: boolean;
  delivered: boolean;
  proceedsForwarded: boolean;
}

/** One read of the salon: its lots and the chain's own clock. */
export interface SalonReading {
  exhibits: SalonExhibit[];
  /**
   * `block.timestamp − wall clock` at the read (seconds). The contract's
   * windows run on block time, so phases are judged against it: on a live
   * network the skew is a few seconds, on a local chain whose time was
   * advanced it is the only correct clock.
   */
  clockSkewSeconds: number;
}

/**
 * Every lot the salon has registered, read from the chain and grouped by
 * cycle (newest first), with the chain clock. Rejects when any read fails,
 * so a failure is never shown as an empty salon.
 */
export async function readSalonExhibits(
  client: PublicClient,
  salon: Address,
): Promise<SalonReading> {
  const at = { address: salon, abi: cosmicSignatureArtAuctionAbi } as const;

  const block = await client.getBlock({ blockTag: 'latest' });
  const clockSkewSeconds = Number(block.timestamp) - Math.floor(Date.now() / 1000);

  const [batchCount, perBatch] = (await readMany(client, [
    { ...at, functionName: 'registeredBatchCount' },
    { ...at, functionName: 'NFTS_PER_BATCH' },
  ])) as [bigint, bigint];

  const firstIds = (await readMany(
    client,
    Array.from({ length: Number(batchCount) }, (_, index) => ({
      ...at,
      functionName: 'firstNftIdByBatchIndex',
      args: [BigInt(index)],
    })),
  )) as readonly bigint[];

  const lotIds = firstIds.flatMap((firstId) =>
    Array.from({ length: Number(perBatch) }, (_, offset) => firstId + BigInt(offset)),
  );

  const states = (await readMany(
    client,
    lotIds.map((id) => ({ ...at, functionName: 'getAuction', args: [id] })),
  )) as readonly LotStateTuple[];

  const minimums = (await readMany(
    client,
    lotIds.map((id) => ({ ...at, functionName: 'minimumNextBid', args: [id] })),
  )) as readonly bigint[];

  const byCycle = new Map<number, SalonLot[]>();
  lotIds.forEach((id, index) => {
    const state = states[index];
    const minimum = minimums[index];
    if (!state || minimum === undefined) {
      throw new Error(`salon lot read came back short at index ${index}`);
    }
    const lot: SalonLot = {
      nftId: Number(id),
      cycle: Number(state.roundNum),
      opensAt: Number(state.eligibleAt),
      closesAt: Number(state.endAt),
      leadingPatron: state.highestBidder.toLowerCase() === ZERO_ADDRESS ? '' : state.highestBidder,
      leadingOffer: state.highestBid,
      minimumNextOffer: minimum,
      concluded: state.settled,
      retrieved: state.delivered,
    };
    const lots = byCycle.get(lot.cycle);
    if (lots) lots.push(lot);
    else byCycle.set(lot.cycle, [lot]);
  });

  const exhibits = [...byCycle.entries()]
    .sort(([a], [b]) => b - a)
    .map(([cycle, lots]) => ({ cycle, lots: lots.sort((a, b) => a.nftId - b.nftId) }));
  return { exhibits, clockSkewSeconds };
}

/** The salon's lots, polled from the chain while the page is open. */
export function useSalonExhibits() {
  const { address: salon, isPending: addressPending, isError: addressError } = useSalonAddress();
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: [SALON_LOTS_QUERY_KEY, salon],
    enabled: !!salon && !!publicClient,
    refetchInterval: LOTS_POLL_MS,
    staleTime: 5_000,
    queryFn: () => readSalonExhibits(publicClient!, salon as Address),
  });

  return {
    exhibits: query.data?.exhibits,
    /** The lots' clocks run on block time; add this to the wall clock. */
    clockSkewSeconds: query.data?.clockSkewSeconds ?? 0,
    isPending: addressPending || (!!salon && query.isPending),
    isError: addressError || query.isError,
    /** `''` while the address is read; stays `''` on a chain without a salon. */
    salonAddress: salon,
  };
}

/** The salon's fixed terms, read once per contract. */
export function useSalonFacts(): SalonFacts | undefined {
  const { address: salon } = useSalonAddress();
  const publicClient = usePublicClient();

  const { data } = useQuery({
    queryKey: [SALON_FACTS_QUERY_KEY, salon],
    enabled: !!salon && !!publicClient,
    staleTime: Infinity,
    queryFn: async () => {
      const at = { address: salon as Address, abi: cosmicSignatureArtAuctionAbi } as const;
      const [perBatch, delay, window, extension, divisor] = (await readMany(publicClient!, [
        { ...at, functionName: 'NFTS_PER_BATCH' },
        { ...at, functionName: 'ELIGIBILITY_DELAY' },
        { ...at, functionName: 'AUCTION_DURATION' },
        { ...at, functionName: 'EXTENSION_DURATION' },
        { ...at, functionName: 'MINIMUM_INCREASE_DIVISOR' },
      ])) as [bigint, bigint, bigint, bigint, bigint];
      return {
        lotsPerCycle: Number(perBatch),
        openingDelaySeconds: Number(delay),
        offerWindowSeconds: Number(window),
        closingExtensionSeconds: Number(extension),
        minimumRaiseDivisor: Number(divisor),
      } satisfies SalonFacts;
    },
  });

  return data;
}

/** The connected wallet's returned offers held by the salon (wei). */
export function useSalonCredit(account: string | undefined): bigint {
  const { address: salon } = useSalonAddress();
  const publicClient = usePublicClient();

  const { data } = useQuery({
    queryKey: [SALON_CREDIT_QUERY_KEY, salon, account?.toLowerCase() ?? ''],
    enabled: !!salon && !!account && !!publicClient,
    refetchInterval: LOTS_POLL_MS,
    queryFn: () =>
      publicClient!.readContract({
        address: salon as Address,
        abi: cosmicSignatureArtAuctionAbi,
        functionName: 'refundCredits',
        args: [account as Address],
      }),
  });

  return data ?? 0n;
}
