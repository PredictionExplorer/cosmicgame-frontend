/**
 * The Cycle Reserve's allocation tracks, in the order every chart of the split lists them.
 * One color per track, taken from the palette tokens, so a reader who learns the colors on
 * /allocation reads the same categories on /allocation/[id], /contracts and /current-cycle.
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

/**
 * Background utility for each track's bar segment and legend swatch, from the named track
 * tokens (--track-*, styles/themes.css). Data categories keep fixed hues in every palette: the
 * palette primary and secondary are close lilacs in Midnight and Nebula, so they cannot tell
 * two tracks apart. The one map for every chart of the split, on both hosts (the landing's
 * AllocationBar draws the compounding remainder hatched in the same hue).
 */
export const ALLOCATION_TRACK_COLORS: Readonly<Record<AllocationTrackId, string>> = {
  signature: 'bg-track-signature',
  chrono: 'bg-track-chrono',
  stellar: 'bg-track-stellar-eth',
  anchor: 'bg-track-anchoring',
  publicGoods: 'bg-track-public-goods',
  nextCycle: 'bg-track-compounding',
};

/** Each track's key under `contracts.funds.segments` (label and tooltip) in the catalogs. */
export const ALLOCATION_TRACK_COPY_KEYS: Readonly<Record<AllocationTrackId, string>> = {
  signature: 'signature',
  chrono: 'chrono',
  stellar: 'stellar',
  anchor: 'anchor',
  publicGoods: 'publicGoods',
  nextCycle: 'next',
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
