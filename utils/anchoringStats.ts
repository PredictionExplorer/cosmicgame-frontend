/**
 * Anchor “distribution per NFT” uses the live staking pool from the game contract
 * (`StakingAmountEth`) divided by the indexed total anchored count (`TotalTokensStaked`).
 * When the DB aggregate is stale or empty, the denominator can be 0 while the pool is still
 * positive — avoid implying a rate exists.
 */
export function formatDistributionPerAnchoredNftEth(
  stakingPoolEth: number | undefined,
  totalAnchoredFromStats: number | undefined,
): { value: string; tooltipSuffix: string } {
  const pool =
    typeof stakingPoolEth === 'number' && Number.isFinite(stakingPoolEth) ? stakingPoolEth : 0;
  const n =
    typeof totalAnchoredFromStats === 'number' && Number.isFinite(totalAnchoredFromStats)
      ? totalAnchoredFromStats
      : 0;
  if (n > 0 && pool > 0) {
    return { value: `${(pool / n).toFixed(6)} ETH`, tooltipSuffix: '' };
  }
  if (pool > 0 && n <= 0) {
    return {
      value: `${pool.toFixed(6)} ETH`,
      tooltipSuffix:
        ' The on-chain anchor pool is non-zero, but the indexed total of anchored CST NFTs is zero (e.g. cg_stake_stats_cst not updated by ETL), so a per-token rate cannot be computed.',
    };
  }
  return { value: '--', tooltipSuffix: '' };
}
