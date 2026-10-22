import { withNextCycleShare, type AllocationTrackId } from '@/config/allocationTracks';

/** The ETH tracks a finalized cycle distributed, in the order every chart of the split uses. */
export const DISTRIBUTED_TRACKS = [
  'signature',
  'chrono',
  'stellar',
  'anchor',
  'publicGoods',
] as const satisfies readonly AllocationTrackId[];

export type DistributedTrackId = (typeof DISTRIBUTED_TRACKS)[number];

/** One track of a finalized cycle's Cycle Reserve. */
export interface CycleReserveShare {
  id: AllocationTrackId;
  /** The ETH the track carried; for the next cycle, what stayed in the reserve. */
  amount: number | null;
  /** The track's share of the Cycle Reserve, in percent; `null` when unknown. */
  percent: number | null;
}

export interface CycleReserveSplit {
  /** The Cycle Reserve at finalization, in ETH; `null` when it cannot be derived. */
  reserve: number | null;
  /** The ETH the five tracks distributed; `null` when any of them is unknown. */
  distributed: number | null;
  /** The five tracks plus the remainder that carried into the next cycle, spanning 100%. */
  shares: CycleReserveShare[];
}

/**
 * Reconstructs the reserve from reported ETH amounts and the historical main
 * allocation percentage. An absent historical percentage leaves proportions
 * and carryover unknown while preserving reported distributed amounts.
 * Integer contract rounding means the reconstructed reserve is approximate.
 */
export function cycleReserveSplit(
  amounts: Readonly<Record<DistributedTrackId, number | null>>,
  signaturePercent: number | null,
): CycleReserveSplit {
  const signature = amounts.signature;
  const reserve =
    signature !== null &&
    signature > 0 &&
    signaturePercent !== null &&
    Number.isFinite(signaturePercent) &&
    signaturePercent > 0 &&
    signaturePercent <= 100
      ? signature / (signaturePercent / 100)
      : null;
  const known = DISTRIBUTED_TRACKS.every((id) => amounts[id] !== null);
  const distributed = known
    ? DISTRIBUTED_TRACKS.reduce((sum, id) => sum + (amounts[id] ?? 0), 0)
    : null;

  const tracks: CycleReserveShare[] = DISTRIBUTED_TRACKS.map((id) => {
    const amount = amounts[id];
    return {
      id,
      amount,
      percent: reserve !== null && amount !== null ? (amount / reserve) * 100 : null,
    };
  });
  const nextCycle: CycleReserveShare = {
    id: 'nextCycle',
    amount: reserve !== null && distributed !== null ? Math.max(0, reserve - distributed) : null,
    percent: withNextCycleShare(tracks).at(-1)?.percent ?? null,
  };

  return { reserve, distributed, shares: [...tracks, nextCycle] };
}
