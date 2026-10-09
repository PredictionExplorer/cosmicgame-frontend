import { summarizeGestures } from '../user-statistics/profileSummary';

/**
 * The API schemas type these amounts as required numbers, so a backend that
 * omits one used to throw `Cannot read properties of undefined (reading
 * 'toFixed')` mid-render and take the surrounding section with it. These cases
 * feed the undefined through the real prop types via a deliberate cast.
 */
const missing = undefined as unknown as number;

describe('unguarded .toFixed regressions', () => {
  it('sums a profile’s spending without NaN when a gesture omits its price', () => {
    const summary = summarizeGestures([
      { RoundNum: 1, GestureCostEth: missing, EthPriceEth: missing },
      { RoundNum: 1, GestureCostEth: Number.NaN, CstCost: missing },
      { RoundNum: 1, GestureCostEth: 0.25 },
    ]);
    expect(summary.ethSpent).toBe(0.25);
    expect(summary.cstSpent).toBe(0);
  });
});
