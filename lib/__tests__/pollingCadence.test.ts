import {
  FINAL_SPRINT_INTERVAL_MS,
  PAST_DEADLINE_FAST_WINDOW_MS,
  getLiveDataPollIntervalMs,
  getRemainingMsToPrizeTime,
} from '../pollingCadence';

describe('getLiveDataPollIntervalMs', () => {
  const BASE = 12_000;

  it('uses the base cadence when no deadline is known', () => {
    expect(getLiveDataPollIntervalMs(null, BASE)).toBe(BASE);
    expect(getLiveDataPollIntervalMs(undefined, BASE)).toBe(BASE);
    expect(getLiveDataPollIntervalMs(Number.NaN, BASE)).toBe(BASE);
  });

  it('uses the base cadence far from the deadline', () => {
    expect(getLiveDataPollIntervalMs(11 * 60_000, BASE)).toBe(BASE);
    expect(getLiveDataPollIntervalMs(24 * 60 * 60_000, BASE)).toBe(BASE);
  });

  it('ramps up as the deadline approaches', () => {
    expect(getLiveDataPollIntervalMs(9 * 60_000, BASE)).toBe(6_000);
    expect(getLiveDataPollIntervalMs(90_000, BASE)).toBe(3_000);
    expect(getLiveDataPollIntervalMs(20_000, BASE)).toBe(FINAL_SPRINT_INTERVAL_MS);
    expect(getLiveDataPollIntervalMs(1_000, BASE)).toBe(FINAL_SPRINT_INTERVAL_MS);
  });

  it('stays fast briefly after the deadline, then relaxes', () => {
    expect(getLiveDataPollIntervalMs(0, BASE)).toBe(FINAL_SPRINT_INTERVAL_MS);
    expect(getLiveDataPollIntervalMs(-30_000, BASE)).toBe(FINAL_SPRINT_INTERVAL_MS);
    expect(getLiveDataPollIntervalMs(-(PAST_DEADLINE_FAST_WINDOW_MS + 1), BASE)).toBe(BASE);
  });

  it('never polls slower than the base cadence', () => {
    expect(getLiveDataPollIntervalMs(9 * 60_000, 2_000)).toBe(2_000);
  });
});

describe('getRemainingMsToPrizeTime', () => {
  const NOW = 1_700_000_000_000;

  it('converts an epoch-seconds prize time to remaining milliseconds', () => {
    expect(getRemainingMsToPrizeTime(NOW / 1000 + 90, NOW)).toBe(90_000);
    expect(getRemainingMsToPrizeTime(NOW / 1000 - 5, NOW)).toBe(-5_000);
  });

  it('returns null for absent or invalid values', () => {
    expect(getRemainingMsToPrizeTime(undefined, NOW)).toBeNull();
    expect(getRemainingMsToPrizeTime(null, NOW)).toBeNull();
    expect(getRemainingMsToPrizeTime(0, NOW)).toBeNull();
    expect(getRemainingMsToPrizeTime('123', NOW)).toBeNull();
    expect(getRemainingMsToPrizeTime(Number.NaN, NOW)).toBeNull();
  });
});
