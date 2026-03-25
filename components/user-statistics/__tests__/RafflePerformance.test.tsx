import { render, screen, checkA11y } from '@/test-utils';

import { RafflePerformance, type RafflePerformanceProps } from '../RafflePerformance';

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

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseProps: RafflePerformanceProps = {
  userInfo: {
    NumBids: 10,
    NumPrizes: 2,
    Address: '0xUser123',
    SumRaffleEthWinnings: 0.5,
    SumRaffleEthWithdrawal: 0.3,
    UnclaimedNFTs: 2,
    RaffleNFTsCount: 4,
    RewardNFTsCount: 6,
    TotalCSTokensWon: 8,
  },
  raffleETHProbability: 0.35,
  raffleNFTProbability: 0.15,
  data: { CurRoundNum: 5, TsRoundStart: 1 } as RafflePerformanceProps['data'],
};

describe('RafflePerformance', () => {
  it('renders the raffle-performance container', () => {
    render(<RafflePerformance {...baseProps} />);
    expect(screen.getByTestId('raffle-performance')).toBeInTheDocument();
  });

  it('renders probability bars when round is active', () => {
    render(<RafflePerformance {...baseProps} />);
    expect(screen.getByText('ETH Raffle')).toBeInTheDocument();
    expect(screen.getByText('NFT Raffle')).toBeInTheDocument();
    expect(screen.getByText('35.00%')).toBeInTheDocument();
    expect(screen.getByText('15.00%')).toBeInTheDocument();
  });

  it('hides probability bars when probability is negative', () => {
    render(
      <RafflePerformance {...baseProps} raffleETHProbability={-1} raffleNFTProbability={-1} />,
    );
    expect(screen.queryByText('ETH Raffle')).not.toBeInTheDocument();
    expect(screen.queryByText('NFT Raffle')).not.toBeInTheDocument();
  });

  it('hides probability bars when round is not active', () => {
    render(
      <RafflePerformance
        {...baseProps}
        data={{ CurRoundNum: 5, TsRoundStart: 0 } as RafflePerformanceProps['data']}
      />,
    );
    expect(screen.queryByText('Current Round Win Probability')).not.toBeInTheDocument();
  });

  it('renders raffle stat cards', () => {
    render(<RafflePerformance {...baseProps} />);
    expect(screen.getByText('Total Raffle ETH')).toBeInTheDocument();
    expect(screen.getByText('ETH Withdrawn')).toBeInTheDocument();
    expect(screen.getByText('Unclaimed NFTs')).toBeInTheDocument();
    expect(screen.getByText('Raffle NFTs')).toBeInTheDocument();
    expect(screen.getByText('Reward NFTs')).toBeInTheDocument();
    expect(screen.getByText('CS Tokens Won')).toBeInTheDocument();
  });

  it('displays correct total raffle ETH', () => {
    render(<RafflePerformance {...baseProps} />);
    expect(screen.getByText('0.8000 ETH')).toBeInTheDocument();
  });

  it('displays correct unclaimed NFTs count', () => {
    render(<RafflePerformance {...baseProps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('links to raffle ETH page', () => {
    render(<RafflePerformance {...baseProps} />);
    const link = screen.getByText('Total Raffle ETH').closest('a');
    expect(link).toHaveAttribute('href', '/user/raffle-eth/0xUser123');
  });

  it('links to raffle NFT page', () => {
    render(<RafflePerformance {...baseProps} />);
    const link = screen.getByText('Raffle NFTs').closest('a');
    expect(link).toHaveAttribute('href', '/user/raffle-nft/0xUser123');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RafflePerformance {...baseProps} />);
    await checkA11y(container);
  });
});
