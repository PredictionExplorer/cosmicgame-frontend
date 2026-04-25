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
  totalAnchorDistributionEth: 0.5,
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

  it('renders gesturing stats', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('Gestures Made')).toBeInTheDocument();
    expect(screen.getByText('Max Gesture')).toBeInTheDocument();
  });

  it('renders stellar-selection stats', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('ETH Stellar Selections Participated')).toBeInTheDocument();
    expect(screen.getByText('NFTs Received')).toBeInTheDocument();
  });

  it('renders anchoring stats', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('Anchor Actions')).toBeInTheDocument();
    expect(screen.getByText('Distributions Received')).toBeInTheDocument();
  });

  it('displays correct gesture count', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('displays combined anchor actions count', () => {
    render(<ActivitySummary {...baseProps} />);
    const anchorLabel = screen.getByText('Anchor Actions');
    const anchorRow = anchorLabel.closest('div')!.parentElement!;
    expect(anchorRow).toHaveTextContent('5');
  });

  it('displays anchor distributions', () => {
    render(<ActivitySummary {...baseProps} />);
    expect(screen.getByText('0.5000 ETH')).toBeInTheDocument();
  });

  it('handles zero anchoring stats gracefully', () => {
    render(
      <ActivitySummary
        userInfo={{
          NumBids: 0,
          NumPrizes: 0,
        }}
        totalAnchorDistributionEth={0}
      />,
    );
    expect(screen.getByTestId('activity-summary')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ActivitySummary {...baseProps} />);
    await checkA11y(container);
  });
});
