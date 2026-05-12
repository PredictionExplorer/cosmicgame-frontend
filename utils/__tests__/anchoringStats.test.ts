import { formatDistributionPerAnchoredNftEth } from '../anchoringStats';

describe('formatDistributionPerAnchoredNftEth', () => {
  it('returns ratio when pool and count are positive', () => {
    const r = formatDistributionPerAnchoredNftEth(2, 4);
    expect(r.value).toBe('0.500000 ETH');
    expect(r.tooltipSuffix).toBe('');
  });

  it('returns pool only when count is zero but pool is positive', () => {
    const r = formatDistributionPerAnchoredNftEth(0.22579451528661923, 0);
    expect(r.value).toBe('0.225795 ETH');
    expect(r.tooltipSuffix).toContain('cg_stake_stats_cst');
  });

  it('returns placeholder when pool is zero', () => {
    expect(formatDistributionPerAnchoredNftEth(0, 10).value).toBe('--');
    expect(formatDistributionPerAnchoredNftEth(0, 0).value).toBe('--');
  });
});
