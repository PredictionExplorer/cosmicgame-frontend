/**
 * Anchoring figures shared by the anchoring hub, /statistics/anchoring and My Anchors, so each
 * metric has one definition on every page.
 */

import { toFiniteNumber } from '@/utils/finiteNumber';

/**
 * The live Anchor Distribution pool (`StakingAmountEth`) divided by the indexed count of
 * anchored Cosmic Signature NFTs (`TotalTokensStaked`).
 *
 * - `available`: a per-NFT figure exists (0 when the pool is still empty).
 * - `noneAnchored`: no anchored NFT is indexed, so no NFT can receive a share — dividing is
 *   meaningless, and showing the whole pool as the per-NFT figure would overstate it.
 * - `unavailable`: the pool or the count could not be read.
 */
export type DistributionPerAnchoredNft =
  | { status: 'available'; perNftEth: number }
  | { status: 'noneAnchored' }
  | { status: 'unavailable' };

/** Computes {@link DistributionPerAnchoredNft}; callers render the status, never a guessed number. */
export function distributionPerAnchoredNft(
  stakingPoolEth: unknown,
  totalAnchoredFromStats: unknown,
): DistributionPerAnchoredNft {
  const pool = toFiniteNumber(stakingPoolEth);
  const count = toFiniteNumber(totalAnchoredFromStats);
  if (pool === null || count === null || pool < 0) return { status: 'unavailable' };
  if (count <= 0) return { status: 'noneAnchored' };
  return { status: 'available', perNftEth: pool / count };
}

/** The fields of a unique anchor-holder row that {@link countActiveAnchorHolders} reads. */
export interface AnchorHolderRow {
  StakerAddr?: string;
  TotalTokensStaked?: number;
}

/**
 * Distinct wallets that currently anchor at least one NFT of either kind. A wallet anchoring
 * both Cosmic Signature and RandomWalk NFTs counts once, and wallets that have released every
 * NFT drop out. `null` until both lists are available.
 */
export function countActiveAnchorHolders(
  cosmicSignatureHolders: readonly AnchorHolderRow[] | null | undefined,
  randomWalkHolders: readonly AnchorHolderRow[] | null | undefined,
): number | null {
  if (!cosmicSignatureHolders || !randomWalkHolders) return null;
  const active = new Set<string>();
  for (const holder of [...cosmicSignatureHolders, ...randomWalkHolders]) {
    if (typeof holder.StakerAddr !== 'string' || holder.StakerAddr === '') continue;
    if ((holder.TotalTokensStaked ?? 0) > 0) active.add(holder.StakerAddr.toLowerCase());
  }
  return active.size;
}
