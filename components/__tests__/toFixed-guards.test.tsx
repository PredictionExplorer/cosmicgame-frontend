import { UNAVAILABLE_VALUE } from '@/utils/format';

import { render, screen } from '@/test-utils';

import { StatCard } from '../ui/stat-card';
import { HeroStats, type HeroStatsProps } from '../user-statistics/HeroStats';

jest.mock('../../utils', () => ({
  formatEthValue: (v: number) => `${v.toFixed(4)} ETH`,
}));

/**
 * The API schemas type these amounts as required numbers, so a backend that
 * omits one used to throw `Cannot read properties of undefined (reading
 * 'toFixed')` mid-render and take the surrounding section with it. These cases
 * feed the undefined through the real prop types via a deliberate cast.
 */
const missing = undefined as unknown as number;

const baseHeroProps: HeroStatsProps = {
  userInfo: {
    NumPrizes: 2,
    NumBids: 10,
    SumRaffleEthWinnings: 7,
    SumRaffleEthWithdrawal: 0.25,
  } as HeroStatsProps['userInfo'],
  balanceETH: 1.5,
  balanceCST: 20,
  stellarSelectionETHProbability: 0.1,
  stellarSelectionNFTProbability: 0.05,
};

describe('unguarded .toFixed regressions', () => {
  it('renders wallet balances normally', () => {
    render(<HeroStats {...baseHeroProps} />);
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('20.00 CST')).toBeInTheDocument();
  });

  it('renders the sentinel instead of crashing when a balance is missing', () => {
    render(<HeroStats {...baseHeroProps} balanceETH={missing} balanceCST={missing} />);
    expect(screen.getByText(`${UNAVAILABLE_VALUE} ETH`)).toBeInTheDocument();
    expect(screen.getByText(`${UNAVAILABLE_VALUE} CST`)).toBeInTheDocument();
  });

  it('renders the sentinel for a NaN balance', () => {
    render(<HeroStats {...baseHeroProps} balanceETH={Number.NaN} />);
    expect(screen.getByText(`${UNAVAILABLE_VALUE} ETH`)).toBeInTheDocument();
    expect(screen.queryByText('NaN ETH')).not.toBeInTheDocument();
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
