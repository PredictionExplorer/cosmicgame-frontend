import type { MarketingReward } from '@/services/api/types';

import {
  isSmallAllocation,
  rankOutreachContributors,
  summarizeOutreachAllocations,
} from '../outreachTotals';

const reward = (
  address: string,
  amount: number,
  id: number,
  timestamp = 1_700_000_000 + id,
): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${id}`,
  TimeStamp: timestamp,
  MarketerAddr: address,
  AmountEth: amount,
});

const A = '0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa';
const B = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB';

describe('rankOutreachContributors', () => {
  it('totals per address, case-insensitively, and ranks by CST received', () => {
    const ranked = rankOutreachContributors([
      reward(A, 100, 1),
      reward(B, 250, 2),
      reward(A.toLowerCase(), 50, 3),
    ]);
    expect(ranked).toEqual([
      { address: B, totalCst: 250, allocations: 1, rank: 1, sharePercent: 62.5 },
      { address: A, totalCst: 150, allocations: 2, rank: 2, sharePercent: 37.5 },
    ]);
  });

  it('gives every share as 0 when nothing has been allocated', () => {
    expect(rankOutreachContributors([reward(A, 0, 1)])[0]?.sharePercent).toBe(0);
    expect(rankOutreachContributors([])).toEqual([]);
  });

  it('counts a malformed amount as 0 rather than poisoning the totals', () => {
    const ranked = rankOutreachContributors([reward(A, Number.NaN, 1), reward(B, 10, 2)]);
    expect(ranked.map((row) => row.totalCst)).toEqual([10, 0]);
    expect(ranked[0]?.sharePercent).toBe(100);
  });
});

describe('isSmallAllocation', () => {
  it('marks what a table would show as <0.01, but not a true zero', () => {
    expect(isSmallAllocation(0)).toBe(false);
    expect(isSmallAllocation(3e-15)).toBe(true);
    expect(isSmallAllocation(0.009)).toBe(true);
    expect(isSmallAllocation(0.01)).toBe(false);
    expect(isSmallAllocation(400)).toBe(false);
  });
});

describe('summarizeOutreachAllocations', () => {
  it('adds up one contributor’s allocations and their date range', () => {
    expect(
      summarizeOutreachAllocations([
        reward(A, 1_000, 1, 1_700_000_300),
        reward(A, 0, 2, 1_700_000_100),
        reward(A, 1_999, 3, 1_700_000_200),
        reward(A, 3e-15, 4, 1_700_000_250),
      ]),
    ).toEqual({
      // 3e-15 is below a double's precision at this magnitude.
      totalCst: 2_999,
      allocations: 4,
      // 3e-15 reads "<0.01"; the true zero is not dust.
      smallAllocations: 1,
      first: 1_700_000_100,
      latest: 1_700_000_300,
    });
  });

  it('has no dates without allocations', () => {
    expect(summarizeOutreachAllocations([])).toEqual({
      totalCst: 0,
      allocations: 0,
      smallAllocations: 0,
      first: null,
      latest: null,
    });
  });

  it('ignores a missing timestamp for the date range', () => {
    const summary = summarizeOutreachAllocations([
      reward(A, 5, 1, 0),
      reward(A, 5, 2, 1_700_000_000),
    ]);
    expect(summary.first).toBe(1_700_000_000);
    expect(summary.latest).toBe(1_700_000_000);
  });
});
