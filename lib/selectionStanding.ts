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
  /** `myGestures / totalGestures`, from 0 to 1. */
  share: number;
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
