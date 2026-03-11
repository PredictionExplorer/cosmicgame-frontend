import { getEnduranceChampions, type EnduranceChampion } from '../endurance';

describe('getEnduranceChampions', () => {
  it('returns empty array for empty bid list', () => {
    expect(getEnduranceChampions([])).toEqual([]);
  });

  it('returns empty array for null bid list', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getEnduranceChampions(null as any)).toEqual([]);
  });

  it('handles a single bid with explicit roundEndTimeStamp', () => {
    const bids = [{ TimeStamp: 1000, BidderAddr: '0xAlice' }];
    const result = getEnduranceChampions(bids, 1500);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      bidder: '0xAlice',
      championTime: 500,
      chronoWarrior: 0,
    });
  });

  it('uses Date.now when roundEndTimeStamp is 0', () => {
    const now = Math.floor(Date.now() / 1000);
    const bids = [{ TimeStamp: now - 100, BidderAddr: '0xBob' }];
    const result = getEnduranceChampions(bids, 0);

    expect(result).toHaveLength(1);
    expect(result[0]!.bidder).toBe('0xBob');
    expect(result[0]!.championTime).toBeGreaterThanOrEqual(99);
    expect(result[0]!.championTime).toBeLessThanOrEqual(102);
  });

  it('computes champion from two bids', () => {
    const bids = [
      { TimeStamp: 1000, BidderAddr: '0xAlice' },
      { TimeStamp: 1200, BidderAddr: '0xBob' },
    ];
    const result = getEnduranceChampions(bids, 1300);

    expect(result.length).toBeGreaterThanOrEqual(1);
    const bidders = result.map((c: EnduranceChampion) => c.bidder);
    expect(bidders).toContain('0xAlice');
  });

  it('sorts unsorted input correctly', () => {
    const bids = [
      { TimeStamp: 1200, BidderAddr: '0xBob' },
      { TimeStamp: 1000, BidderAddr: '0xAlice' },
    ];
    const result = getEnduranceChampions(bids, 1300);

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.bidder).toBe('0xAlice');
  });

  it('tracks increasing champion records across multiple bids', () => {
    const bids = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1010, BidderAddr: '0xB' }, // gap=10
      { TimeStamp: 1050, BidderAddr: '0xC' }, // gap=40, new champion
      { TimeStamp: 1060, BidderAddr: '0xD' }, // gap=10, not champion
    ];
    const result = getEnduranceChampions(bids, 1070);

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0]!.bidder).toBe('0xA');
    expect(result[0]!.championTime).toBe(10);
    expect(result[1]!.bidder).toBe('0xB');
    expect(result[1]!.championTime).toBe(40);
  });

  it('includes last bidder when their window is the longest', () => {
    const bids = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1005, BidderAddr: '0xB' }, // gap=5
    ];
    const result = getEnduranceChampions(bids, 2000);

    const lastChampion = result[result.length - 1]!;
    expect(lastChampion.bidder).toBe('0xB');
    expect(lastChampion.championTime).toBe(995);
  });

  it('does not include last bidder when their window is shorter', () => {
    const bids = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 2000, BidderAddr: '0xB' }, // gap=1000
    ];
    const result = getEnduranceChampions(bids, 2005);

    expect(result).toHaveLength(1);
    expect(result[0]!.bidder).toBe('0xA');
    expect(result[0]!.championTime).toBe(1000);
  });

  it('computes chronoWarrior values', () => {
    const bids = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1010, BidderAddr: '0xB' },
      { TimeStamp: 1050, BidderAddr: '0xC' },
    ];
    const result = getEnduranceChampions(bids, 1100);

    result.forEach((c: EnduranceChampion) => {
      expect(c.chronoWarrior).toBeGreaterThanOrEqual(0);
    });
  });

  it('returns objects with bidder, championTime, chronoWarrior fields only', () => {
    const bids = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1100, BidderAddr: '0xB' },
    ];
    const result = getEnduranceChampions(bids, 1200);

    result.forEach((c: EnduranceChampion) => {
      expect(Object.keys(c).sort()).toEqual(['bidder', 'championTime', 'chronoWarrior']);
    });
  });

  it('handles bids with identical timestamps', () => {
    const bids = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1000, BidderAddr: '0xB' },
    ];
    const result = getEnduranceChampions(bids, 1500);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
