import { normalizeDashboardWire } from '@/services/api/rounds';

/**
 * `TokenReward` arrives as a wei string. Converting with `Number(wei) / 1e18`
 * rounds the integer to a double before dividing, which drops digits above
 * 2^53 wei (~0.009 ETH) — small enough that every realistic reward is
 * affected. These cases pin the single-rounding behaviour.
 */
describe('normalizeDashboardWire — TokenReward precision', () => {
  const gestureCostOf = (tokenReward: unknown) =>
    normalizeDashboardWire({ TokenReward: tokenReward }).ParticipationCstReward;

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

  it('leaves the reward unknown for the sentinel wire values instead of reporting 0', () => {
    for (const sentinel of ['', 'error', undefined, null, 42]) {
      const normalized = normalizeDashboardWire({ TokenReward: sentinel });
      expect(normalized).not.toHaveProperty('ParticipationCstReward');
    }
  });

  it('falls back to the numeric parse for non-integer strings', () => {
    expect(gestureCostOf('1.5')).toBeCloseTo(1.5e-18);
    expect(gestureCostOf('nonsense')).toBeUndefined();
  });

  it('leaves an explicit ParticipationCstReward untouched', () => {
    const normalized = normalizeDashboardWire({
      ParticipationCstReward: 0.5,
      TokenReward: '100000000000000000000',
    });
    expect(normalized.ParticipationCstReward).toBe(0.5);
  });
});

describe('normalizeDashboardWire — units', () => {
  // Regression: the imprint summary once printed "185.6693 ETH" as the Gesture Cost because
  // TokenReward (a CST amount) was normalized into an ETH-named field.
  const wire = {
    BidPriceEth: 0.10210695701197195,
    TokenReward: '185669300000000000000',
  };

  it('maps the ETH Gesture Cost from BidPriceEth only', () => {
    expect(normalizeDashboardWire(wire).CurBidPriceEth).toBe(0.10210695701197195);
  });

  it('exposes TokenReward only as a CST amount, never under an ETH name', () => {
    const normalized = normalizeDashboardWire(wire);
    expect(normalized.ParticipationCstReward).toBeCloseTo(185.6693);
    expect(normalized).not.toHaveProperty('GestureCostEth');
  });
});
