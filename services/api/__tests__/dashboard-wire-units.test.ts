import { normalizeDashboardWire } from '@/services/api/rounds';

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

  it('never turns TokenReward into an ETH figure', () => {
    const normalized = normalizeDashboardWire(wire);
    // Passed through as the wire sent it (a CST amount in wei, which nothing reads) …
    expect(normalized.TokenReward).toBe(wire.TokenReward);
    // … and no field the normalizer adds holds it.
    const added = Object.keys(normalized).filter((key) => !(key in wire));
    expect(added).toEqual(['CurBidPriceEth']);
    expect(normalized).not.toHaveProperty('GestureCostEth');
  });

  it('keeps an explicit CurBidPriceEth over the wire BidPriceEth', () => {
    expect(normalizeDashboardWire({ ...wire, CurBidPriceEth: 0.2 }).CurBidPriceEth).toBe(0.2);
  });
});
