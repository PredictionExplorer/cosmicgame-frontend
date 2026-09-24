import {
  clockShards,
  getLandingCycleTimerSnapshot,
  mergeLandingCyclePoll,
  padClock,
  type LandingCyclePoll,
  type LandingCycleReading,
} from '../landing-cycle-clock';
import type { LandingDashboardSnapshot } from '../landing-cycle-data';

function dashboard(overrides: Partial<LandingDashboardSnapshot> = {}): LandingDashboardSnapshot {
  return {
    CurRoundNum: 12,
    CurNumBids: 34,
    TsRoundStart: 1,
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    ...overrides,
  };
}

const sampledAtMs = 1_000_000;
const goodPoll: LandingCyclePoll = {
  targetServerTimeSec: 8_200,
  currentServerTimeSec: 1_000,
  dashboard: dashboard(),
  sampledAtMs,
};
const reading = mergeLandingCyclePoll(null, goodPoll);

describe('mergeLandingCyclePoll', () => {
  it('records a complete poll as a fresh reading', () => {
    expect(reading).toEqual({
      targetServerTimeSec: 8_200,
      currentServerTimeSec: 1_000,
      sampledAtMs,
      dashboard: dashboard(),
      lastSuccessAtMs: sampledAtMs,
      lastAttemptFailed: false,
    });
  });

  it('keeps the last good value of every read that failed', () => {
    const next = mergeLandingCyclePoll(reading, {
      targetServerTimeSec: null,
      currentServerTimeSec: null,
      dashboard: null,
      sampledAtMs: sampledAtMs + 12_000,
    });
    expect(next).toEqual({ ...reading, lastAttemptFailed: true });
  });

  it('takes the reads that succeeded and keeps the server clock paired with its sample time', () => {
    const next = mergeLandingCyclePoll(reading, {
      targetServerTimeSec: 9_000,
      currentServerTimeSec: null,
      dashboard: dashboard({ CurNumBids: 35 }),
      sampledAtMs: sampledAtMs + 12_000,
    });
    expect(next.targetServerTimeSec).toBe(9_000);
    expect(next.dashboard?.CurNumBids).toBe(35);
    // The old clock sample stays with the moment it was read.
    expect(next.currentServerTimeSec).toBe(1_000);
    expect(next.sampledAtMs).toBe(sampledAtMs);
    // Partial success is not a fresh reading.
    expect(next.lastSuccessAtMs).toBe(sampledAtMs);
    expect(next.lastAttemptFailed).toBe(true);
  });

  it('drops the previous cycle’s target when a new cycle arrives without one', () => {
    const newCycle = mergeLandingCyclePoll(reading, {
      targetServerTimeSec: null,
      currentServerTimeSec: 9_000,
      dashboard: dashboard({ CurRoundNum: 13, CurNumBids: 1 }),
      sampledAtMs: sampledAtMs + 8_000_000,
    });
    expect(newCycle.dashboard?.CurRoundNum).toBe(13);
    expect(newCycle.targetServerTimeSec).toBeNull();

    // Within one cycle, a missing target still keeps the last good one.
    const sameCycle = mergeLandingCyclePoll(reading, {
      ...goodPoll,
      targetServerTimeSec: null,
      dashboard: dashboard({ CurNumBids: 35 }),
    });
    expect(sameCycle.targetServerTimeSec).toBe(8_200);
  });

  it('dates a later complete poll as the new last success', () => {
    const later = { ...goodPoll, sampledAtMs: sampledAtMs + 24_000, currentServerTimeSec: 1_024 };
    const next = mergeLandingCyclePoll(
      mergeLandingCyclePoll(reading, { ...goodPoll, dashboard: null }),
      later,
    );
    expect(next.lastSuccessAtMs).toBe(sampledAtMs + 24_000);
    expect(next.lastAttemptFailed).toBe(false);
  });
});

describe('getLandingCycleTimerSnapshot', () => {
  it('builds a live countdown from the same server target and clock shape as the app', () => {
    const snapshot = getLandingCycleTimerSnapshot({ reading, nowMs: sampledAtMs });

    expect(snapshot.phase).toBe('approach');
    expect(snapshot.targetMs).toBe(sampledAtMs + 7_200_000);
    expect(snapshot.finalizationTargetMs).toBe(sampledAtMs + 7_200_000);
    expect(snapshot.showCountdown).toBe(true);
    expect(snapshot.shards).toEqual([
      { unit: 'days', value: 0 },
      { unit: 'hours', value: 2 },
      { unit: 'minutes', value: 0 },
      { unit: 'seconds', value: 0 },
    ]);
    expect(snapshot.gestureCount).toBe(34);
    expect(snapshot.cycleNumber).toBe(12);
  });

  it('moves through urgency phases as the Cycle Finalization Time approaches', () => {
    const at = (offsetMs: number) =>
      getLandingCycleTimerSnapshot({ reading, nowMs: sampledAtMs + offsetMs }).phase;
    expect(at(61 * 60 * 1000)).toBe('final-hour');
    expect(at(116 * 60 * 1000)).toBe('final-ten');
    expect(at(119 * 60 * 1000 + 10_000)).toBe('final-minute');
    expect(at(7_300_000)).toBe('ready-to-finalize');
  });

  it('counts down to the cycle opening while the activation time is ahead', () => {
    const activationTime = sampledAtMs / 1000 + 900;
    const snapshot = getLandingCycleTimerSnapshot({
      reading: {
        ...reading,
        dashboard: dashboard({
          CurRoundStats: { ActivationTime: activationTime },
          TsRoundStart: 0,
        }),
      },
      nowMs: sampledAtMs,
    });

    expect(snapshot.phase).toBe('opening-soon');
    expect(snapshot.targetMs).toBe(activationTime * 1000);
    expect(snapshot.showCountdown).toBe(true);
  });

  it('projects the activation through a chain clock that is ahead of the browser', () => {
    const snapshot = getLandingCycleTimerSnapshot({
      reading: {
        ...reading,
        currentServerTimeSec: 100_000,
        dashboard: dashboard({
          CurRoundStats: { ActivationTime: 100_600 },
          TsRoundStart: 0,
          LastBidderAddr: '0x0000000000000000000000000000000000000000',
        }),
      },
      nowMs: sampledAtMs,
    });

    expect(snapshot.phase).toBe('opening-soon');
    expect(snapshot.remainingMs).toBe(600_000);
  });

  it('waits for the first Gesture without a ticking countdown', () => {
    const snapshot = getLandingCycleTimerSnapshot({
      reading: {
        ...reading,
        dashboard: dashboard({
          TsRoundStart: 0,
          LastBidderAddr: '0x0000000000000000000000000000000000000000',
        }),
      },
      nowMs: sampledAtMs,
    });

    expect(snapshot.phase).toBe('waiting-first-gesture');
    expect(snapshot.showCountdown).toBe(false);
  });

  it('is loading before the first reading arrives', () => {
    expect(getLandingCycleTimerSnapshot({ reading: null, nowMs: sampledAtMs }).phase).toBe(
      'loading',
    );
  });

  it('is unavailable only when no dashboard ever arrived and the poll failed', () => {
    const failed: LandingCycleReading = mergeLandingCyclePoll(null, {
      targetServerTimeSec: null,
      currentServerTimeSec: null,
      dashboard: null,
      sampledAtMs,
    });
    expect(getLandingCycleTimerSnapshot({ reading: failed, nowMs: sampledAtMs }).phase).toBe(
      'unavailable',
    );
  });

  it('never announces ready to finalize because the finalization time failed to load', () => {
    // Regression: a missing target used to project to 0, which reads as a
    // deadline in the past and flipped the landing to "ready to finalize".
    const withoutTarget = mergeLandingCyclePoll(null, { ...goodPoll, targetServerTimeSec: null });
    const snapshot = getLandingCycleTimerSnapshot({ reading: withoutTarget, nowMs: sampledAtMs });

    expect(snapshot.phase).toBe('loading');
    expect(snapshot.showCountdown).toBe(false);
    expect(snapshot.cycleNumber).toBe(12);
  });

  it('never pairs a new cycle with the previous cycle’s past target', () => {
    // Regression (F219): the poll that first saw cycle 13 after its first
    // gesture lost the time read, and the carried cycle-12 target, already
    // past, announced "ready to finalize".
    const nowMs = sampledAtMs + 8_000_000;
    const newCycle = mergeLandingCyclePoll(reading, {
      targetServerTimeSec: null,
      currentServerTimeSec: 9_000,
      dashboard: dashboard({ CurRoundNum: 13, CurNumBids: 1, TsRoundStart: 8_900 }),
      sampledAtMs: nowMs,
    });
    const snapshot = getLandingCycleTimerSnapshot({ reading: newCycle, nowMs });

    expect(snapshot.phase).toBe('loading');
    expect(snapshot.cycleNumber).toBe(13);
  });

  it('keeps counting from the last good reading after a failed poll', () => {
    const afterFailure = mergeLandingCyclePoll(reading, {
      targetServerTimeSec: null,
      currentServerTimeSec: null,
      dashboard: null,
      sampledAtMs: sampledAtMs + 12_000,
    });
    const snapshot = getLandingCycleTimerSnapshot({
      reading: afterFailure,
      nowMs: sampledAtMs + 12_000,
    });

    expect(snapshot.phase).toBe('approach');
    expect(snapshot.remainingMs).toBe(7_188_000);
  });
});

describe('clock helpers', () => {
  it('splits a span into days, hours, minutes and seconds', () => {
    expect(clockShards(((123 * 24 + 4) * 3600 + 5 * 60 + 6) * 1000).map((s) => s.value)).toEqual([
      123, 4, 5, 6,
    ]);
    expect(clockShards(-5_000).map((s) => s.value)).toEqual([0, 0, 0, 0]);
  });

  it('pads every unit to two digits', () => {
    expect(padClock(4)).toBe('04');
    expect(padClock(123)).toBe('123');
    expect(padClock(-1)).toBe('00');
  });
});
