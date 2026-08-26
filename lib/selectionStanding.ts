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
 * draw, drawn uniformly from the cycle's gesture pool. Shared by the
 * GestureStatus card and the Deck personal strip so the two surfaces can
 * never disagree.
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
