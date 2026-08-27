/**
 * Single source of truth for live allocation-track amounts.
 *
 * The observatory ribbon, the standings reward chips, and the full
 * allocation breakdown all derive their figures here so the same track can
 * never show two different amounts on one page.
 */

/** The dashboard fields consumed by the track derivation (structural). */
export interface AllocationTrackSource {
  PrizeAmountEth?: number;
  CurPrizeAmountEth?: number;
  RaffleAmountEth?: number;
  StakingAmountEth?: number;
  CosmicGameBalanceEth?: number;
  PrizePercentage?: number;
  ChronoWarriorPercentage?: number;
  RafflePercentage?: number;
  StakingPercentage?: number;
  CharityPercentage?: number;
  NumRaffleEthWinnersBidding?: number;
  NumRaffleNFTWinnersBidding?: number;
  NumRaffleNFTWinnersStakingRWalk?: number;
}

export interface AllocationTrackAmounts {
  /** ETH portion of the Signature Allocation (main track). */
  signatureEth: number;
  /** ETH share of the Chrono-Warrior track (balance × live percentage). */
  chronoEth: number;
  /** Total ETH shared by the ETH Stellar Selection recipients. */
  stellarEth: number;
  /** ETH per ETH Stellar Selection recipient. */
  stellarEthEach: number;
  stellarEthRecipients: number;
  stellarNftRecipients: number;
  /** ETH added to the Cosmic Signature anchor distribution this cycle. */
  cosmicAnchorEth: number;
  rwlkAnchorRecipients: number;
  /** ETH forwarded to public goods (balance × live percentage). */
  publicGoodsEth: number;
  /**
   * Percentage of the reserve that stays in the protocol and seeds the next
   * cycle. Derived from the live dashboard percentages; null when the
   * dashboard does not report a full percentage set.
   */
  nextCyclePercent: number | null;
  /** ETH staying to seed the next cycle (0 when the percentage is unknown). */
  nextCycleEth: number;
}

function finiteOrZero(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function finiteOrNull(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function deriveAllocationTrackAmounts(
  data: AllocationTrackSource | null | undefined,
): AllocationTrackAmounts {
  const balanceEth = finiteOrZero(data?.CosmicGameBalanceEth);
  const stellarEth = finiteOrZero(data?.RaffleAmountEth);
  const stellarEthRecipients = finiteOrZero(data?.NumRaffleEthWinnersBidding);

  const signaturePercent = finiteOrNull(data?.PrizePercentage);
  const chronoPercent = finiteOrNull(data?.ChronoWarriorPercentage);
  const stellarPercent = finiteOrNull(data?.RafflePercentage);
  const anchorPercent = finiteOrNull(data?.StakingPercentage);
  const publicGoodsPercent = finiteOrNull(data?.CharityPercentage);

  // The distributed share is only trustworthy when the dashboard reports the
  // complete percentage set; a partial sum would overstate the rollover.
  const distributedPercent =
    signaturePercent != null &&
    chronoPercent != null &&
    stellarPercent != null &&
    anchorPercent != null &&
    publicGoodsPercent != null
      ? signaturePercent + chronoPercent + stellarPercent + anchorPercent + publicGoodsPercent
      : null;
  const nextCyclePercent =
    distributedPercent != null ? Math.max(0, Math.min(100, 100 - distributedPercent)) : null;

  return {
    signatureEth: finiteOrZero(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth),
    chronoEth: (balanceEth * finiteOrZero(data?.ChronoWarriorPercentage)) / 100,
    stellarEth,
    stellarEthEach: stellarEthRecipients > 0 ? stellarEth / stellarEthRecipients : 0,
    stellarEthRecipients,
    stellarNftRecipients: finiteOrZero(data?.NumRaffleNFTWinnersBidding),
    cosmicAnchorEth: finiteOrZero(data?.StakingAmountEth),
    rwlkAnchorRecipients: finiteOrZero(data?.NumRaffleNFTWinnersStakingRWalk),
    publicGoodsEth: (balanceEth * finiteOrZero(data?.CharityPercentage)) / 100,
    nextCyclePercent,
    nextCycleEth: nextCyclePercent != null ? (balanceEth * nextCyclePercent) / 100 : 0,
  };
}
