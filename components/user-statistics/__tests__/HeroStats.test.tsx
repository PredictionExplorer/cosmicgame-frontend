import { render, screen, checkA11y } from '@/test-utils';

import { HeroStats, type HeroStatsProps } from '../HeroStats';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div
        data-testid={props['data-testid'] as string | undefined}
        className={props.className as string | undefined}
      >
        {children}
      </div>
    ),
  },
}));

jest.mock('../../../utils', () => ({
  formatEthValue: (v: number) => `${v.toFixed(4)} ETH`,
}));

const baseProps: HeroStatsProps = {
  userInfo: {
    NumBids: 42,
    NumPrizes: 5,
    MaxBidAmount: 0.05,
    MaxWinAmount: 1.5,
    SumRaffleEthWinnings: 0.8,
    SumRaffleEthWithdrawal: 0.2,
    Address: '0xUser',
  },
  balanceETH: 3.1415,
  balanceCST: 250.5,
  stellarSelectionETHProbability: 0.25,
  stellarSelectionNFTProbability: 0.1,
};

describe('HeroStats', () => {
  it('renders all 6 stat cards', () => {
    render(<HeroStats {...baseProps} />);
    expect(screen.getByText('ETH Balance')).toBeInTheDocument();
    expect(screen.getByText('CST Balance')).toBeInTheDocument();
    expect(screen.getByText('Signature Allocations Received')).toBeInTheDocument();
    expect(screen.getByText('Total ETH Received')).toBeInTheDocument();
    expect(screen.getByText('Gestures Made')).toBeInTheDocument();
    expect(screen.getByText('Selection Frequency')).toBeInTheDocument();
  });

  it('displays ETH balance value', () => {
    render(<HeroStats {...baseProps} />);
    expect(screen.getByText('3.1415 ETH')).toBeInTheDocument();
  });

  it('displays CST balance value', () => {
    render(<HeroStats {...baseProps} />);
    expect(screen.getByText('250.50 CST')).toBeInTheDocument();
  });

  it('displays gesture count', () => {
    render(<HeroStats {...baseProps} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays allocations won', () => {
    render(<HeroStats {...baseProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays win probability as percentage', () => {
    render(<HeroStats {...baseProps} />);
    expect(screen.getByText('25.00%')).toBeInTheDocument();
  });

  it('displays "--" when probabilities are negative', () => {
    render(
      <HeroStats
        {...baseProps}
        stellarSelectionETHProbability={-1}
        stellarSelectionNFTProbability={-1}
      />,
    );
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders skeleton loading state', () => {
    render(<HeroStats {...baseProps} loading={true} />);
    expect(screen.getByTestId('hero-stats-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('ETH Balance')).not.toBeInTheDocument();
  });

  it('renders the hero-stats container', () => {
    render(<HeroStats {...baseProps} />);
    expect(screen.getByTestId('hero-stats')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HeroStats {...baseProps} />);
    await checkA11y(container);
  });
});
