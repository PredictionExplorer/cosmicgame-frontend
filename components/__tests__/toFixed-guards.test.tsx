import { UNAVAILABLE_VALUE } from '@/utils/format';

import { render, screen } from '@/test-utils';

import { StatCard } from '../ui/stat-card';
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

  it('keeps the stat-card trend output unchanged for a real delta', () => {
    render(<StatCard label="Cycles" value="12" trend={{ delta: 4.25, label: 'vs last cycle' }} />);
    expect(screen.getByText('+4.3%')).toBeInTheDocument();
  });

  it('renders the sentinel rather than NaN% for a missing stat-card delta', () => {
    render(
      <StatCard label="Cycles" value="12" trend={{ delta: missing, label: 'vs last cycle' }} />,
    );
    expect(screen.getByText(`${UNAVAILABLE_VALUE}%`)).toBeInTheDocument();
    expect(screen.queryByText('NaN%')).not.toBeInTheDocument();
  });
});
