import { render, screen, checkA11y } from '@/test-utils';

import { ActivitySummary, type ActivitySummaryProps } from '../ActivitySummary';

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

const baseProps: ActivitySummaryProps = {
  userInfo: {
    NumBids: 20,
    NumPrizes: 3,
    MaxBidAmount: 0.1,
    NumRaffleEthWinnings: 5,
    RaffleNFTsCount: 2,
    StakingStatisticsRWalk: {
      TotalNumStakeActions: 4,
      TotalNumUnstakeActions: 1,
      TotalTokensStaked: 3,
      TotalTokensMinted: 2,
    },
  },
  totalStakeRewardEth: 0.5,
};

describe('ActivitySummary', () => {
  it('renders the activity summary container', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByTestId('activity-summary')).toBeInTheDocument();
  });

  it('renders activity overview heading', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('Activity Overview')).toBeInTheDocument();
  });

  it('renders bidding stats', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('Bids Placed')).toBeInTheDocument();
    expect(screen.getByText('Max Bid')).toBeInTheDocument();
  });

  it('renders raffle stats', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('ETH Raffles Entered')).toBeInTheDocument();
    expect(screen.getByText('NFTs Won')).toBeInTheDocument();
  });

  it('renders staking stats', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('Stake Actions')).toBeInTheDocument();
    expect(screen.getByText('Rewards Earned')).toBeInTheDocument();
  });

  it('displays correct bid count', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('displays combined stake actions count', () => {
    render(<ActivitySummary {...baseProps} />);
    const stakeLabel = screen.getByText('Stake Actions');
    const stakeRow = stakeLabel.closest('div')!.parentElement!;
    expect(stakeRow).toHaveTextContent('5');
  });

  it('displays staking rewards', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('0.5000 ETH')).toBeInTheDocument();
  });

  it('handles zero staking stats gracefully', () => {
    render(
      <ActivitySummary
        userInfo={{
          NumBids: 0,
          NumPrizes: 0,
        }}
        totalStakeRewardEth={0}
      />,
    );
    expect(screen.getByTestId('activity-summary')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ActivitySummary {...baseProps} />);
    await checkA11y(container);
  });
});
