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

export interface SelectionStandingInput {
  /** Total gestures in the current cycle. */
  totalGestures: number;
  /** The connected wallet's gestures in the current cycle. */
  myGestures: number;
  ethRecipients: number;
  nftRecipients: number;
}

export interface SelectionStanding {
  /** Percent likelihood of at least one ETH Stellar Selection. */
  stellarEth: number;
  /** Percent likelihood of at least one NFT Stellar Selection. */
  nft: number;
}

/**
 * Stellar Selection standing for a wallet: the complement of missing every
 * draw, drawn uniformly from the cycle's gesture pool.
 *
 * @deprecated Compounds the share into a chance of at least one selection,
 * which reads as lottery odds (99.48% for a 41% share). Show
 * `getSelectionShare` instead; the home strip and the experimental status
 * card still read this until they move.
 */
export function getSelectionStanding({
  totalGestures,
  myGestures,
  ethRecipients,
  nftRecipients,
}: SelectionStandingInput): SelectionStanding | null {
  if (totalGestures <= 0 || myGestures <= 0) return null;
  const pSelect = (total: number, chosen: number, yours: number) =>
    1 - Math.pow((total - yours) / total, chosen);
  return {
    stellarEth: pSelect(totalGestures, Math.max(1, ethRecipients), myGestures) * 100,
    nft: pSelect(totalGestures, Math.max(1, nftRecipients), myGestures) * 100,
  };
}
