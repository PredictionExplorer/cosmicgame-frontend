import { countdownSeconds, countdownUnits } from '../countdown';

describe('countdown rounding', () => {
  it('rounds up to whole seconds, so zero lands exactly on the deadline', () => {
    expect(countdownSeconds(1)).toBe(1);
    expect(countdownSeconds(999)).toBe(1);
    expect(countdownSeconds(1000)).toBe(1);
    expect(countdownSeconds(1001)).toBe(2);
    expect(countdownSeconds(0)).toBe(0);
  });

  it('never counts below zero or from a broken reading', () => {
    expect(countdownSeconds(-5_000)).toBe(0);
    expect(countdownSeconds(Number.NaN)).toBe(0);
    expect(countdownSeconds(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('splits the time left into the clock groups', () => {
    // 5d 10:55:18.4 reads 5d 10:55:19, like the dock.
    const remaining = ((5 * 24 + 10) * 3600 + 55 * 60 + 18) * 1000 + 400;
    expect(countdownUnits(remaining)).toEqual({ days: 5, hours: 10, minutes: 55, seconds: 19 });
    expect(countdownUnits(59_001)).toEqual({ days: 0, hours: 0, minutes: 1, seconds: 0 });
  });
});
