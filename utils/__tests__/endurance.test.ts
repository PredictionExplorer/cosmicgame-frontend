import { getEnduranceChampions, type EnduranceChampion } from '../endurance';

describe('getEnduranceChampions', () => {
  it('returns empty array for empty gesture list', () => {
    expect(getEnduranceChampions([])).toEqual([]);
  });

  it('returns empty array for null gesture list', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getEnduranceChampions(null as any)).toEqual([]);
  });

  it('handles a single gesture with explicit roundEndTimeStamp', () => {
    const gestures = [{ TimeStamp: 1000, BidderAddr: '0xAlice' }];
    const result = getEnduranceChampions(gestures, 1500);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      participant: '0xAlice',
      championTime: 500,
      chronoWarrior: 0,
    });
  });

  it('uses Date.now when roundEndTimeStamp is 0', () => {
    const now = Math.floor(Date.now() / 1000);
    const gestures = [{ TimeStamp: now - 100, BidderAddr: '0xBob' }];
    const result = getEnduranceChampions(gestures, 0);

    expect(result).toHaveLength(1);
    expect(result[0]!.participant).toBe('0xBob');
    expect(result[0]!.championTime).toBeGreaterThanOrEqual(99);
    expect(result[0]!.championTime).toBeLessThanOrEqual(102);
  });

  it('uses explicit nowTimeStamp when roundEndTimeStamp is 0', () => {
    const gestures = [{ TimeStamp: 1_000, BidderAddr: '0xBob' }];
    const result = getEnduranceChampions(gestures, 0, 1_250);

    expect(result).toEqual([
      {
        participant: '0xBob',
        championTime: 250,
        chronoWarrior: 0,
      },
    ]);
  });

  it('prefers explicit roundEndTimeStamp over nowTimeStamp for finalized cycles', () => {
    const gestures = [{ TimeStamp: 1_000, BidderAddr: '0xBob' }];
    const result = getEnduranceChampions(gestures, 1_100, 1_500);

    expect(result[0]!.championTime).toBe(100);
  });

  it('does not mutate the original gesture list while sorting', () => {
    const gestures = [
      { TimeStamp: 1_200, BidderAddr: '0xBob' },
      { TimeStamp: 1_000, BidderAddr: '0xAlice' },
    ];

    getEnduranceChampions(gestures, 0, 1_300);

    expect(gestures.map((g) => g.BidderAddr)).toEqual(['0xBob', '0xAlice']);
  });

  it('computes champion from two gestures', () => {
    const gestures = [
      { TimeStamp: 1000, BidderAddr: '0xAlice' },
      { TimeStamp: 1200, BidderAddr: '0xBob' },
    ];
    const result = getEnduranceChampions(gestures, 1300);

    expect(result.length).toBeGreaterThanOrEqual(1);
    const participants = result.map((c: EnduranceChampion) => c.participant);
    expect(participants).toContain('0xAlice');
  });

  it('sorts unsorted input correctly', () => {
    const gestures = [
      { TimeStamp: 1200, BidderAddr: '0xBob' },
      { TimeStamp: 1000, BidderAddr: '0xAlice' },
    ];
    const result = getEnduranceChampions(gestures, 1300);

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]!.participant).toBe('0xAlice');
  });

  it('tracks increasing champion records across multiple gestures', () => {
    const gestures = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1010, BidderAddr: '0xB' }, // gap=10
      { TimeStamp: 1050, BidderAddr: '0xC' }, // gap=40, new champion
      { TimeStamp: 1060, BidderAddr: '0xD' }, // gap=10, not champion
    ];
    const result = getEnduranceChampions(gestures, 1070);

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0]!.participant).toBe('0xA');
    expect(result[0]!.championTime).toBe(10);
    expect(result[1]!.participant).toBe('0xB');
    expect(result[1]!.championTime).toBe(40);
  });

  it('includes last participant when their window is the longest', () => {
    const gestures = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1005, BidderAddr: '0xB' }, // gap=5
    ];
    const result = getEnduranceChampions(gestures, 2000);

    const lastChampion = result[result.length - 1]!;
    expect(lastChampion.participant).toBe('0xB');
    expect(lastChampion.championTime).toBe(995);
  });

  it('does not include last participant when their window is shorter', () => {
    const gestures = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 2000, BidderAddr: '0xB' }, // gap=1000
    ];
    const result = getEnduranceChampions(gestures, 2005);

    expect(result).toHaveLength(1);
    expect(result[0]!.participant).toBe('0xA');
    expect(result[0]!.championTime).toBe(1000);
  });

  it('keeps the earlier champion when a later window ties the record', () => {
    const gestures = [
      { TimeStamp: 1_000, BidderAddr: '0xA' },
      { TimeStamp: 1_100, BidderAddr: '0xB' },
      { TimeStamp: 1_200, BidderAddr: '0xC' },
    ];
    const result = getEnduranceChampions(gestures, 1_300);

    expect(result).toHaveLength(1);
    expect(result[0]!.participant).toBe('0xA');
    expect(result[0]!.championTime).toBe(100);
  });

  it('handles same-address consecutive gestures as separate uninterrupted windows', () => {
    const gestures = [
      { TimeStamp: 1_000, BidderAddr: '0xA' },
      { TimeStamp: 1_030, BidderAddr: '0xA' },
      { TimeStamp: 1_100, BidderAddr: '0xB' },
    ];
    const result = getEnduranceChampions(gestures, 1_110);

    expect(result.map((c) => c.participant)).toEqual(['0xA', '0xA']);
    expect(result.map((c) => c.championTime)).toEqual([30, 70]);
  });

  it('computes chronoWarrior values', () => {
    const gestures = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1010, BidderAddr: '0xB' },
      { TimeStamp: 1050, BidderAddr: '0xC' },
    ];
    const result = getEnduranceChampions(gestures, 1100);

    result.forEach((c: EnduranceChampion) => {
      expect(c.chronoWarrior).toBeGreaterThanOrEqual(0);
    });
  });

  it('keeps chrono warrior deterministic for an ongoing last-bidder champion', () => {
    const gestures = [
      { TimeStamp: 1_000, BidderAddr: '0xA' },
      { TimeStamp: 1_010, BidderAddr: '0xB' },
      { TimeStamp: 1_050, BidderAddr: '0xC' },
    ];
    const result = getEnduranceChampions(gestures, 0, 1_100);

    const ongoingChampion = result[result.length - 1]!;
    expect(ongoingChampion.participant).toBe('0xC');
    expect(ongoingChampion.championTime).toBe(50);
    expect(ongoingChampion.chronoWarrior).toBeGreaterThanOrEqual(0);
  });

  it('returns objects with participant, championTime, chronoWarrior fields only', () => {
    const gestures = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1100, BidderAddr: '0xB' },
    ];
    const result = getEnduranceChampions(gestures, 1200);

    result.forEach((c: EnduranceChampion) => {
      expect(Object.keys(c).sort()).toEqual(['championTime', 'chronoWarrior', 'participant']);
    });
  });

  it('handles gestures with identical timestamps', () => {
    const gestures = [
      { TimeStamp: 1000, BidderAddr: '0xA' },
      { TimeStamp: 1000, BidderAddr: '0xB' },
    ];
    const result = getEnduranceChampions(gestures, 1500);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
