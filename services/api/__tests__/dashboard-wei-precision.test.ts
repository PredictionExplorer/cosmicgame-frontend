import { normalizeDashboardWire } from '@/services/api/rounds';

/**
 * `TokenReward` arrives as a wei string. Converting with `Number(wei) / 1e18`
 * rounds the integer to a double before dividing, which drops digits above
 * 2^53 wei (~0.009 ETH) — small enough that every realistic reward is
 * affected. These cases pin the single-rounding behaviour.
 */
describe('normalizeDashboardWire — TokenReward precision', () => {
  const gestureCostOf = (tokenReward: unknown) =>
    normalizeDashboardWire({ TokenReward: tokenReward }).GestureCostEth;

  it('converts a whole-ETH reward exactly', () => {
    expect(gestureCostOf('100000000000000000000')).toBe(100);
    expect(gestureCostOf('1000000000000000000')).toBe(1);
  });

  it('keeps the low-order digits that the lossy conversion drops', () => {
    const wei = '12345678901234567890123';
    expect(gestureCostOf(wei)).toBe(Number('12345.678901234567890123'));
  });

  it('is at least as accurate as the previous Number(wei) / 1e18 conversion', () => {
    const wei = '123456789012345678901';
    const lossy = Number(BigInt(wei)) / 1e18;
    const exact = gestureCostOf(wei) as number;
    const truth = Number('123.456789012345678901');

    expect(Math.abs(exact - truth)).toBeLessThanOrEqual(Math.abs(lossy - truth));
  });

  it('still reports 0 for the sentinel wire values', () => {
    expect(gestureCostOf('')).toBe(0);
    expect(gestureCostOf('error')).toBe(0);
    expect(gestureCostOf(undefined)).toBe(0);
    expect(gestureCostOf(null)).toBe(0);
    expect(gestureCostOf(42)).toBe(0);
  });

  it('falls back to the numeric parse for non-integer strings', () => {
    expect(gestureCostOf('1.5')).toBeCloseTo(1.5e-18);
    expect(gestureCostOf('nonsense')).toBe(0);
  });

  it('leaves an explicit GestureCostEth untouched', () => {
    const normalized = normalizeDashboardWire({
      GestureCostEth: 0.5,
      TokenReward: '100000000000000000000',
    });
    expect(normalized.GestureCostEth).toBe(0.5);
  });
});
