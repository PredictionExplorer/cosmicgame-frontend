/**
 * V3 Stellar Selection pool weights, assembled from the Game contract's own
 * getters (`roundStats` and `getBidInfoAt`).
 *
 * V3 selects ETH recipients by gesture weight, not by gesture count: each
 * gesture's weight is its undiscounted ETH cost at the moment it was made,
 * stored on-chain as a running (cumulative) total. A single gesture's weight
 * is therefore `cumulative[i] - cumulative[i - 1]`, and the whole pool's
 * weight is the last gesture's cumulative value.
 *
 * On V2 deployments the getters do not exist, and for cycles finished before
 * the V3 upgrade every stored weight reads 0. Both cases yield no pool here
 * (`buildSelectionPool` returns null), and callers keep the V1/V2 formula:
 * gesture count over the cycle's total. NFT Stellar Selections remain
 * count-based in every version; the weighted share applies to the ETH pool.
 */

/** One gesture of the cycle, in gesture order, as the contract reports it. */
export interface SelectionPoolEntry {
  /** The gesture's participant. */
  gesturerAddress: string;
  /** The pool's running weight total up to and including this gesture. */
  cumulativeWeight: bigint;
}

/** The cycle's weighted Stellar Selection pool. */
export interface SelectionPool {
  /** The cycle (bidding round) the pool belongs to. */
  cycle: number;
  /** Every gesture in the cycle, per the contract. */
  numGestures: number;
  /** The whole pool's weight: the last gesture's cumulative value. */
  totalWeight: bigint;
  /** Summed weight per participant, keyed by lowercased address. */
  weightByAddress: ReadonlyMap<string, bigint>;
  /** Gesture count per participant, keyed by lowercased address. */
  countByAddress: ReadonlyMap<string, number>;
}

/**
 * Folds the contract's per-gesture readings into a pool. Null when the
 * entries carry no weight (a cycle finished before the V3 upgrade, where the
 * stored weights read 0) — the caller then keeps the count-based share, which
 * is exactly what those cycles selected by.
 */
export function buildSelectionPool(
  cycle: number,
  entries: readonly SelectionPoolEntry[],
): SelectionPool | null {
  const lastEntry = entries[entries.length - 1];
  if (!lastEntry) return null;
  const totalWeight = lastEntry.cumulativeWeight;
  if (totalWeight <= 0n) return null;
  const weightByAddress = new Map<string, bigint>();
  const countByAddress = new Map<string, number>();
  let previousCumulative = 0n;
  for (const entry of entries) {
    const key = entry.gesturerAddress.toLowerCase();
    // Clamp defensively: the cumulative sequence is non-decreasing on-chain.
    const weight =
      entry.cumulativeWeight > previousCumulative
        ? entry.cumulativeWeight - previousCumulative
        : 0n;
    previousCumulative = entry.cumulativeWeight;
    weightByAddress.set(key, (weightByAddress.get(key) ?? 0n) + weight);
    countByAddress.set(key, (countByAddress.get(key) ?? 0) + 1);
  }
  return { cycle, numGestures: entries.length, totalWeight, weightByAddress, countByAddress };
}

/**
 * A participant's part of the weighted pool, from 0 to 1; null without a
 * usable total. Weights are uint96-scale wei sums, far inside Number's safe
 * range as a ratio, so the division happens in floating point after a
 * common-scale reduction.
 */
export function poolShareOf(pool: SelectionPool, address: string | null | undefined): number {
  if (!address) return 0;
  const weight = pool.weightByAddress.get(address.toLowerCase()) ?? 0n;
  if (weight <= 0n || pool.totalWeight <= 0n) return 0;
  // Scale to 1e9 resolution before converting, so giant wei totals stay exact.
  const RESOLUTION = 1_000_000_000n;
  return Number((weight * RESOLUTION) / pool.totalWeight) / Number(RESOLUTION);
}
