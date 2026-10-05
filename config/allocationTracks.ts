import { toFiniteNumber } from '@/utils/finiteNumber';

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
 * Background utility for each track's bar segment and legend swatch: the design system's
 * `--track-*` series (docs/design-system.md, "Data series"). They are fixed hues in every
 * palette (styles/themes.css), 4.5:1 or more on every surface, and no two tracks share one:
 * the palette primary and secondary are close lilacs in Midnight and Nebula, so they cannot
 * tell two tracks apart; red is never a track, and the remainder that carries into the next
 * cycle takes the neutral series. The one map for every chart of the split, on both hosts
 * (the landing's AllocationBar draws that remainder hatched in the same hue), so a track
 * reads the same on every page and chart.
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

/** The dashboard fields that carry each distributed track's share of the Cycle Reserve. */
export interface DashboardTrackShares {
  PrizePercentage?: unknown;
  ChronoWarriorPercentage?: unknown;
  RafflePercentage?: unknown;
  StakingPercentage?: unknown;
  CharityPercentage?: unknown;
}

/** A share in percent, clamped into [0, 100]; `null` when it is not a finite number. */
function clampShare(value: unknown): number | null {
  const numeric = toFiniteNumber(value);
  return numeric === null ? null : Math.min(100, Math.max(0, numeric));
}

/**
 * The Cycle Reserve split as the dashboard reports it: every track in the
 * shared order, each share clamped into [0, 100], completed with the
 * remainder that carries into the next cycle. The one mapping behind
 * /contracts, /current-cycle and the operator settings, so an out-of-range
 * figure reads the same everywhere.
 */
export function allocationSharesFromDashboard(
  data: DashboardTrackShares | null | undefined,
): AllocationTrackShare[] {
  return withNextCycleShare([
    { id: 'signature', percent: clampShare(data?.PrizePercentage) },
    { id: 'chrono', percent: clampShare(data?.ChronoWarriorPercentage) },
    { id: 'stellar', percent: clampShare(data?.RafflePercentage) },
    { id: 'anchor', percent: clampShare(data?.StakingPercentage) },
    { id: 'publicGoods', percent: clampShare(data?.CharityPercentage) },
  ]);
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
