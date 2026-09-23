/**
 * The Cycle Reserve's allocation tracks, in the order every chart of the split lists them.
 * One color per track, taken from the palette tokens, so a reader who learns the colors on
 * /allocation reads the same categories on /allocation/[id] and /contracts.
 */
export const ALLOCATION_TRACK_IDS = [
  'signature',
  'chrono',
  'stellar',
  'anchor',
  'publicGoods',
  'nextCycle',
] as const;

export type AllocationTrackId = (typeof ALLOCATION_TRACK_IDS)[number];

/** Background utility for each track's bar segment and legend swatch. */
export const ALLOCATION_TRACK_COLORS: Readonly<Record<AllocationTrackId, string>> = {
  signature: 'bg-[rgb(var(--aurora-cyan-rgb))]',
  chrono: 'bg-[rgb(var(--nebula-violet-rgb))]',
  stellar: 'bg-[rgb(var(--solar-gold-rgb))]',
  anchor: 'bg-[rgb(var(--impact-green-rgb))]',
  publicGoods: 'bg-[rgb(var(--chrono-rose-rgb))]',
  nextCycle: 'bg-muted-foreground/40',
};

/** A track's share of a whole, in percent. `null` when the share could not be read. */
export interface AllocationTrackShare {
  id: AllocationTrackId;
  percent: number | null;
}

/**
 * Completes the distributed tracks' shares of the Cycle Reserve with the remainder that
 * carries into the next cycle, so the chart spans exactly 100% instead of stretching the
 * distributed tracks across the full width. The remainder is `null` (unknown) when any
 * share is unknown, and never negative.
 */
export function withNextCycleShare(
  distributed: readonly AllocationTrackShare[],
): AllocationTrackShare[] {
  const known = distributed.every(
    (share) => share.percent !== null && Number.isFinite(share.percent),
  );
  const sum = distributed.reduce((total, share) => total + (share.percent ?? 0), 0);
  return [...distributed, { id: 'nextCycle', percent: known ? Math.max(0, 100 - sum) : null }];
}
