/**
 * Anchor "distribution per NFT" uses the live staking pool from the game contract
 * (`StakingAmountEth`) divided by the indexed total anchored count (`TotalTokensStaked`).
 * When the DB aggregate is stale or empty, the denominator can be 0 while the pool is still
 * positive - avoid implying a rate exists.
 */
export function formatDistributionPerAnchoredNftEth(
  stakingPoolEth: number | undefined,
  totalAnchoredFromStats: number | undefined,
  locale: string = 'en',
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
      tooltipSuffix: locale.toLowerCase().startsWith('zh')
        ? ' 链上锚定派发池并非 0，但已索引的 Cosmic Signature NFT 锚定总数为 0（例如 cg_stake_stats_cst 尚未由 ETL 更新），因此无法计算每枚 NFT 的派发额。'
        : ' The on-chain anchor pool is non-zero, but the indexed total of anchored Cosmic Signature NFTs is zero (e.g. cg_stake_stats_cst not updated by ETL), so a per-NFT rate cannot be computed.',
    };
  }
  return { value: '--', tooltipSuffix: '' };
}
