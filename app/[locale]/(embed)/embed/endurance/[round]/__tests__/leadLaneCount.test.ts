/**
 * @jest-environment node
 */
import { LIVE_LANES_SECONDS, countLeadLanes, readLeadLaneCount } from '../leadLaneCount';

const mockList = jest.fn();
jest.mock('../../../../../../../services/api/rounds', () => ({
  get_bid_list_by_round: (...args: unknown[]) => mockList(...args),
}));

jest.mock('next/cache', () => ({
  unstable_cache: jest.fn(<T extends (...args: never[]) => unknown>(fn: T) => fn),
}));

beforeEach(() => mockList.mockReset());

describe('countLeadLanes', () => {
  it('counts distinct makers whatever their casing, skipping blanks', () => {
    expect(
      countLeadLanes([
        { BidderAddr: '0xAbC' },
        { BidderAddr: '0xabc' },
        { BidderAddr: '0xdef' },
        { BidderAddr: null },
        {},
      ]),
    ).toBe(2);
  });
});

describe('readLeadLaneCount', () => {
  it('keeps a finalized cycle’s count for good and the live one’s for a minute', () => {
    const { unstable_cache } = jest.requireMock<{ unstable_cache: jest.Mock }>('next/cache');
    expect(unstable_cache.mock.calls.map((call: unknown[]) => call.slice(1))).toEqual([
      [['embed-lead-lanes', 'final']],
      [['embed-lead-lanes', 'live'], { revalidate: LIVE_LANES_SECONDS }],
    ]);
  });

  it('reads the cycle’s list once and returns only the count', async () => {
    mockList.mockResolvedValue([{ BidderAddr: '0x1' }, { BidderAddr: '0x2' }]);
    await expect(readLeadLaneCount(1, 2)).resolves.toBe(2);
    expect(mockList).toHaveBeenCalledWith(1, 'asc');
  });

  it('never throws: a failed read leaves the default skeleton', async () => {
    mockList.mockRejectedValue(new Error('upstream down'));
    await expect(readLeadLaneCount(2, 2)).resolves.toBeUndefined();
    await expect(readLeadLaneCount(0, undefined)).resolves.toBeUndefined();
  });
});
