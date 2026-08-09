import {
  getEnduranceChampions,
  getEnduranceGantt,
  getEnduranceTimeline,
  type EnduranceChampion,
} from '../endurance';

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

  it('keeps chrono warrior deterministic for an ongoing latest-participant champion', () => {
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

const HOUR = 3600;

/**
 * Reference cycle used across the timeline and Gantt suites.
 *
 * Lead stints: A holds 0→100 (100s), B holds 100→400 (300s), C holds
 * 400→1000 (600s, and 1000→1200 once the cycle is finalized at 1200).
 * Every stint sets a new endurance record, so the champion lineage is
 * A → B → C and the chrono reigns tile the cycle as [0,200), [200,700),
 * [700,end).
 */
const CYCLE = [
  { TimeStamp: 0, BidderAddr: '0xA' },
  { TimeStamp: 100, BidderAddr: '0xB' },
  { TimeStamp: 400, BidderAddr: '0xC' },
];

describe('getEnduranceTimeline', () => {
  it('returns a zeroed timeline for an empty gesture list', () => {
    expect(getEnduranceTimeline([])).toEqual({
      points: [],
      roundStart: 0,
      roundEnd: 0,
      finalEnduranceRecord: 0,
      finalChronoRecord: 0,
    });
  });

  it('returns a zeroed timeline for a null gesture list', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getEnduranceTimeline(null as any).points).toEqual([]);
  });

  it('spans a single gesture from its timestamp to the cycle end', () => {
    const timeline = getEnduranceTimeline([{ TimeStamp: 500, BidderAddr: '0xA' }], 1_500);

    expect(timeline.roundStart).toBe(500);
    expect(timeline.roundEnd).toBe(1_500);
    expect(timeline.finalEnduranceRecord).toBe(1_000);
    expect(timeline.finalChronoRecord).toBe(1_000);
    expect(timeline.points).toEqual([
      { ts: 500, hoursIntoRound: 0, lead: 0, enduranceRecord: 0, chronoRecord: 0, leader: '0xA' },
      {
        ts: 1_500,
        hoursIntoRound: 1_000 / HOUR,
        lead: 1_000,
        enduranceRecord: 1_000,
        chronoRecord: 1_000,
        leader: '0xA',
      },
    ]);
  });

  it('emits an opening and closing sample for every stint', () => {
    const timeline = getEnduranceTimeline(CYCLE, 1_000);

    expect(timeline.points).toHaveLength(CYCLE.length * 2);
    expect(timeline.points.map((p) => p.ts)).toEqual([0, 100, 100, 400, 400, 1_000]);
    expect(timeline.points.map((p) => p.leader)).toEqual([
      '0xA',
      '0xA',
      '0xB',
      '0xB',
      '0xC',
      '0xC',
    ]);
  });

  it('resets the lead to zero at each handover and ramps to the stint length', () => {
    const timeline = getEnduranceTimeline(CYCLE, 1_000);

    expect(timeline.points.map((p) => p.lead)).toEqual([0, 100, 0, 300, 0, 600]);
  });

  it('advances the endurance record only after a stint completes', () => {
    const timeline = getEnduranceTimeline(CYCLE, 1_000);

    // The opening sample of a stint still shows the previous record; the
    // closing sample is where a new record lands.
    expect(timeline.points.map((p) => p.enduranceRecord)).toEqual([0, 100, 100, 300, 300, 600]);
    expect(timeline.finalEnduranceRecord).toBe(600);
  });

  it('grows the chrono record monotonically across the cycle', () => {
    const timeline = getEnduranceTimeline(CYCLE, 1_000);
    const chrono = timeline.points.map((p) => p.chronoRecord);

    expect(chrono).toEqual([0, 100, 100, 200, 200, 500]);
    expect(chrono).toEqual([...chrono].sort((a, b) => a - b));
    expect(timeline.finalChronoRecord).toBe(500);
  });

  it('expresses the x-axis as hours since the first gesture', () => {
    const timeline = getEnduranceTimeline(
      [
        { TimeStamp: 10_000, BidderAddr: '0xA' },
        { TimeStamp: 10_000 + HOUR, BidderAddr: '0xB' },
      ],
      10_000 + 3 * HOUR,
    );

    expect(timeline.points.map((p) => p.hoursIntoRound)).toEqual([0, 1, 1, 3]);
  });

  it('runs to now when the cycle has not been finalized', () => {
    const timeline = getEnduranceTimeline(CYCLE, 0, 2_000);

    expect(timeline.roundEnd).toBe(2_000);
    expect(timeline.finalEnduranceRecord).toBe(1_600);
  });

  it('prefers an explicit cycle end over now', () => {
    const timeline = getEnduranceTimeline(CYCLE, 1_000, 9_999);

    expect(timeline.roundEnd).toBe(1_000);
  });

  it('clamps a stale now that predates the newest gesture', () => {
    // A lagging client clock must not produce a negative final stint.
    const timeline = getEnduranceTimeline(CYCLE, 0, 200);

    expect(timeline.roundEnd).toBe(400);
    expect(timeline.points.every((p) => p.lead >= 0)).toBe(true);
    expect(timeline.points[timeline.points.length - 1]!.lead).toBe(0);
  });

  it('sorts unsorted input before reconstructing the cycle', () => {
    const shuffled = [CYCLE[2]!, CYCLE[0]!, CYCLE[1]!];

    expect(getEnduranceTimeline(shuffled, 1_000)).toEqual(getEnduranceTimeline(CYCLE, 1_000));
  });

  it('does not mutate the caller list while sorting', () => {
    const shuffled = [CYCLE[2]!, CYCLE[0]!, CYCLE[1]!];

    getEnduranceTimeline(shuffled, 1_000);

    expect(shuffled.map((g) => g.BidderAddr)).toEqual(['0xC', '0xA', '0xB']);
  });

  it('records a zero-length stint for two gestures sharing a timestamp', () => {
    const timeline = getEnduranceTimeline(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 0, BidderAddr: '0xB' },
      ],
      600,
    );

    expect(timeline.points.map((p) => p.lead)).toEqual([0, 0, 0, 600]);
    expect(timeline.finalEnduranceRecord).toBe(600);
  });

  it('keeps the earlier reign when two chrono segments tie', () => {
    // Reigns are [0,200), [200,700) and [700,1200): the last two both last
    // 500s, and the record must not double-count them.
    const timeline = getEnduranceTimeline(CYCLE, 1_200);

    expect(timeline.finalChronoRecord).toBe(500);
  });
});

describe('getEnduranceGantt', () => {
  it('returns an empty Gantt for an empty gesture list', () => {
    expect(getEnduranceGantt([])).toEqual({
      lanes: [],
      roundStart: 0,
      roundEnd: 0,
      roundDurationSeconds: 0,
      enduranceChampionAddress: '',
      enduranceChampionStintSeconds: 0,
      chronoWarriorAddress: '',
      chronoWarriorSeconds: 0,
    });
  });

  it('returns an empty Gantt for a null gesture list', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getEnduranceGantt(null as any).lanes).toEqual([]);
  });

  it('keeps the cycle duration at least one second when nothing has elapsed', () => {
    // Every stint is zero-length here, so a raw duration would be 0 and any
    // bar-width percentage would divide by zero.
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 100, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
      ],
      100,
    );

    expect(gantt.lanes).toEqual([]);
    expect(gantt.roundStart).toBe(100);
    expect(gantt.roundEnd).toBe(100);
    expect(gantt.roundDurationSeconds).toBe(1);
    expect(gantt.enduranceChampionAddress).toBe('');
  });

  it('builds one bar per lead stint with hour-scaled geometry', () => {
    const gantt = getEnduranceGantt([{ TimeStamp: 0, BidderAddr: '0xA' }], 2 * HOUR);

    expect(gantt.lanes).toHaveLength(1);
    expect(gantt.lanes[0]!.stints).toEqual([
      {
        address: '0xA',
        startTs: 0,
        endTs: 2 * HOUR,
        durationSeconds: 2 * HOUR,
        startHours: 0,
        durationHours: 2,
        isEnduranceChampion: true,
        isRecord: true,
      },
    ]);
  });

  it('groups repeat stints from one address into a single lane', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
        { TimeStamp: 400, BidderAddr: '0xA' },
        { TimeStamp: 1_000, BidderAddr: '0xC' },
      ],
      1_200,
    );

    const laneA = gantt.lanes.find((lane) => lane.address === '0xA')!;

    expect(gantt.lanes).toHaveLength(3);
    expect(laneA.stints).toHaveLength(2);
    expect(laneA.totalSeconds).toBe(700);
    expect(laneA.maxStintSeconds).toBe(600);
  });

  it('orders lanes by total lead time, longest first', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
        { TimeStamp: 400, BidderAddr: '0xA' },
        { TimeStamp: 1_000, BidderAddr: '0xC' },
      ],
      1_200,
    );

    expect(gantt.lanes.map((lane) => lane.address)).toEqual(['0xA', '0xB', '0xC']);
    expect(gantt.lanes.map((lane) => lane.totalSeconds)).toEqual([700, 300, 200]);
  });

  it('crowns the single longest stint as endurance champion', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
        { TimeStamp: 400, BidderAddr: '0xA' },
        { TimeStamp: 1_000, BidderAddr: '0xC' },
      ],
      1_200,
    );

    expect(gantt.enduranceChampionAddress).toBe('0xA');
    expect(gantt.enduranceChampionStintSeconds).toBe(600);

    const championStints = gantt.lanes
      .flatMap((lane) => lane.stints)
      .filter((stint) => stint.isEnduranceChampion);

    // Exactly one bar is the champion — the 600s stint, not A's other one.
    expect(championStints).toHaveLength(1);
    expect(championStints[0]!.durationSeconds).toBe(600);
  });

  it('marks every record-setting stint but not the ones that fall short', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
        { TimeStamp: 400, BidderAddr: '0xA' },
        { TimeStamp: 1_000, BidderAddr: '0xC' },
      ],
      1_200,
    );

    const records = gantt.lanes
      .flatMap((lane) => lane.stints)
      .filter((stint) => stint.isRecord)
      .map((stint) => stint.durationSeconds)
      .sort((a, b) => a - b);

    // 100 → 300 → 600 each set a record; C's closing 200s stint does not.
    expect(records).toEqual([100, 300, 600]);
  });

  it('awards the chrono warrior to the earlier of two equal reigns', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
        { TimeStamp: 400, BidderAddr: '0xA' },
        { TimeStamp: 1_000, BidderAddr: '0xC' },
      ],
      1_200,
    );

    expect(gantt.chronoWarriorSeconds).toBe(500);
    expect(gantt.chronoWarriorAddress).toBe('0xB');
    expect(gantt.lanes.filter((lane) => lane.isChronoWarrior)).toHaveLength(1);
  });

  it('flags the champion and chrono lanes independently', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
        { TimeStamp: 400, BidderAddr: '0xA' },
        { TimeStamp: 1_000, BidderAddr: '0xC' },
      ],
      1_200,
    );

    const byAddress = Object.fromEntries(gantt.lanes.map((lane) => [lane.address, lane]));

    expect(byAddress['0xA']).toMatchObject({ isEnduranceChampion: true, isChronoWarrior: false });
    expect(byAddress['0xB']).toMatchObject({ isEnduranceChampion: false, isChronoWarrior: true });
    expect(byAddress['0xC']).toMatchObject({ isEnduranceChampion: false, isChronoWarrior: false });
  });

  it('drops zero-length stints so a same-second handover gets no lane', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xGhost' },
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 100, BidderAddr: '0xB' },
      ],
      200,
    );

    expect(gantt.lanes.map((lane) => lane.address)).toEqual(['0xA', '0xB']);
  });

  it('runs an unfinished cycle to now', () => {
    const gantt = getEnduranceGantt([{ TimeStamp: 0, BidderAddr: '0xA' }], 0, 900);

    expect(gantt.roundEnd).toBe(900);
    expect(gantt.roundDurationSeconds).toBe(900);
    expect(gantt.enduranceChampionStintSeconds).toBe(900);
  });

  it('prefers an explicit cycle end over now', () => {
    const gantt = getEnduranceGantt([{ TimeStamp: 0, BidderAddr: '0xA' }], 600, 9_999);

    expect(gantt.roundEnd).toBe(600);
  });

  it('clamps a stale now that predates the newest gesture', () => {
    const gantt = getEnduranceGantt(
      [
        { TimeStamp: 0, BidderAddr: '0xA' },
        { TimeStamp: 1_000, BidderAddr: '0xB' },
      ],
      0,
      500,
    );

    expect(gantt.roundEnd).toBe(1_000);
    expect(gantt.lanes.flatMap((lane) => lane.stints).every((s) => s.durationSeconds > 0)).toBe(
      true,
    );
  });

  it('sorts unsorted input before building lanes', () => {
    const ordered = [
      { TimeStamp: 0, BidderAddr: '0xA' },
      { TimeStamp: 100, BidderAddr: '0xB' },
      { TimeStamp: 400, BidderAddr: '0xC' },
    ];
    const shuffled = [ordered[2]!, ordered[0]!, ordered[1]!];

    expect(getEnduranceGantt(shuffled, 1_000)).toEqual(getEnduranceGantt(ordered, 1_000));
  });

  it('does not mutate the caller list while sorting', () => {
    const shuffled = [
      { TimeStamp: 400, BidderAddr: '0xC' },
      { TimeStamp: 0, BidderAddr: '0xA' },
    ];

    getEnduranceGantt(shuffled, 1_000);

    expect(shuffled.map((g) => g.BidderAddr)).toEqual(['0xC', '0xA']);
  });

  it('agrees with getEnduranceChampions on the champion lineage', () => {
    const gantt = getEnduranceGantt(CYCLE, 1_200);
    const champions = getEnduranceChampions(CYCLE, 1_200);

    const recordAddresses = gantt.lanes
      .flatMap((lane) => lane.stints)
      .filter((stint) => stint.isRecord)
      .sort((a, b) => a.startTs - b.startTs)
      .map((stint) => stint.address);

    expect(recordAddresses).toEqual(champions.map((c) => c.participant));
  });
});
