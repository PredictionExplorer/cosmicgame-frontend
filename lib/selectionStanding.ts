/**
 * Stellar Selection figures for a wallet, computed in one place.
 *
 * Every Stellar Selection draws from all of the cycle's gestures, one entry
 * per gesture, with replacement. A wallet's standing is therefore its share
 * of those gestures: 42 of 1,135 gestures is 3.7% of the pool. Surfaces show
 * that linear share next to the count it comes from, and say how many
 * selections are drawn; they never compound it into a chance of "at least
 * one" selection, which rises toward 100% with every paid entry and reads as
 * lottery odds.
 */

export interface SelectionShareInput {
  /** Every gesture in the cycle. */
  totalGestures: number;
  /** The wallet's gestures in the cycle. */
  myGestures: number;
}

export interface SelectionShare {
  myGestures: number;
  totalGestures: number;
  /**
   * The wallet's part of the pool, from 0 to 1. Count-based on V1/V2 cycles
   * (`myGestures / totalGestures`); on V3 cycles the ETH pool is weighted by
   * each gesture's ETH cost, read from the contract (lib/selectionWeights).
   */
  share: number;
  /** True when `share` comes from the V3 contract's gesture weights. */
  weighted?: boolean;
}

/**
 * A wallet's share of the cycle's Stellar Selection pool, or `null` when the
 * cycle has no gestures yet or the wallet has none in it.
 */
export function getSelectionShare({
  totalGestures,
  myGestures,
}: SelectionShareInput): SelectionShare | null {
  if (!Number.isFinite(totalGestures) || !Number.isFinite(myGestures)) return null;
  if (totalGestures <= 0 || myGestures <= 0) return null;
  const mine = Math.min(myGestures, totalGestures);
  return { myGestures: mine, totalGestures, share: mine / totalGestures };
}

export interface WeightedSelectionShareInput extends SelectionShareInput {
  /** The whole pool's weight, from the contract's cumulative figures. */
  totalWeight: bigint;
  /** The wallet's summed gesture weights. */
  myWeight: bigint;
}

/**
 * A wallet's weighted share of a V3 cycle's ETH Stellar Selection pool. The
 * gesture counts still come along for the "{mine} of {total} gestures" line;
 * only the percentage is weight-based. Null when the wallet has no weight
 * (which on a V3 cycle also means no gestures) or the pool is empty.
 */
export function getWeightedSelectionShare({
  totalGestures,
  myGestures,
  totalWeight,
  myWeight,
}: WeightedSelectionShareInput): SelectionShare | null {
  const base = getSelectionShare({ totalGestures, myGestures });
  if (!base) return null;
  if (totalWeight <= 0n || myWeight <= 0n) return null;
  // Reduce to 1e9 resolution before converting, so wei-scale totals stay exact.
  const RESOLUTION = 1_000_000_000n;
  const clamped = myWeight > totalWeight ? totalWeight : myWeight;
  const share = Number((clamped * RESOLUTION) / totalWeight) / Number(RESOLUTION);
  return { ...base, share, weighted: true };
}
