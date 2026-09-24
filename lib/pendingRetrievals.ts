import { toFiniteNumber } from '@/utils/finiteNumber';

/** The red-box fields that say what waits for a wallet to retrieve. */
export interface PendingRetrievalSource {
  ETHRaffleToClaim?: unknown;
  ETHChronoWarriorToClaim?: unknown;
  NumDonatedNFTToClaim?: unknown;
  UnretrievedAnchorDistribution?: unknown;
  /** Anchor Distributions retrievable now (deposits whose action ids resolved). */
  claimableActionIds?: readonly unknown[] | null;
}

export interface PendingRetrievals {
  /** ETH allocations waiting in the allocation wallet (Stellar Selection and Chrono-Warrior). */
  eth: number;
  /** Anchor Distribution ETH that can be retrieved now. */
  anchorEth: number;
  /** Attached NFTs waiting. */
  nfts: number;
  hasAny: boolean;
}

function positive(value: unknown): number {
  const n = toFiniteNumber(value);
  return n != null && n > 0 ? n : 0;
}

/**
 * The one rule for "something waits to be retrieved", shared by the header
 * indicator, the wallet menu and the home's standing so they always agree
 * (F157). Anchor Distributions count only once a retrievable action exists;
 * an accrued amount with nothing to retrieve yet does not.
 */
export function summarizePendingRetrievals(
  source: PendingRetrievalSource | null | undefined,
): PendingRetrievals {
  if (!source) return { eth: 0, anchorEth: 0, nfts: 0, hasAny: false };
  const eth = positive(source.ETHRaffleToClaim) + positive(source.ETHChronoWarriorToClaim);
  const anchorEth =
    (source.claimableActionIds?.length ?? 0) > 0
      ? positive(source.UnretrievedAnchorDistribution)
      : 0;
  const nfts = Math.floor(positive(source.NumDonatedNFTToClaim));
  return { eth, anchorEth, nfts, hasAny: eth > 0 || anchorEth > 0 || nfts > 0 };
}
