import { render, screen, checkA11y } from '@/test-utils';

import { StatRow, UserStatsSection, type UserProfileInfo } from '../UserStatsSection';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('../../../utils', () => ({
  formatEthValue: (v: number) => `${v.toFixed(4)} ETH`,
}));

const userInfo: UserProfileInfo = {
  NumBids: 10,
  NumPrizes: 3,
  MaxBidAmount: 0.05,
  MaxWinAmount: 1.5,
  CosmicSignatureNumTransfers: 2,
  TotalCSTokensWon: 5,
  Address: '0xUser',
  SumRaffleEthWinnings: 0.1,
  SumRaffleEthWithdrawal: 0.05,
  UnclaimedNFTs: 1,
  NumRaffleEthWinnings: 4,
  RaffleNFTsCount: 2,
  RewardNFTsCount: 7,
};

describe('StatRow', () => {
  it('renders label and children', () => {
    render(<StatRow label="My Label:">My Value</StatRow>);
    expect(screen.getByText('My Label:')).toBeInTheDocument();
    expect(screen.getByText('My Value')).toBeInTheDocument();
  });
});

describe('UserStatsSection', () => {
  const defaultProps = {
    userInfo,
    balanceETH: 1.5,
    balanceCST: 100,
    raffleETHProbability: 0.25,
    raffleNFTProbability: 0.1,
    data: null,
  };

  it('renders number of bids', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders ETH balance when non-zero', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByText('ETH Balance:')).toBeInTheDocument();
  });

  it('hides ETH balance when zero', () => {
    render(<UserStatsSection {...defaultProps} balanceETH={0} />);
    expect(screen.queryByText('ETH Balance:')).not.toBeInTheDocument();
  });

  it('renders raffle probabilities', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByText('25.00%')).toBeInTheDocument();
    expect(screen.getByText('10.00%')).toBeInTheDocument();
  });

  it('hides probabilities when negative', () => {
    render(<UserStatsSection {...defaultProps} raffleETHProbability={-1} />);
    expect(screen.queryByText('Probability of Winning ETH:')).not.toBeInTheDocument();
  });

  it('renders transfer links', () => {
    render(<UserStatsSection {...defaultProps} />);
    expect(screen.getByText(/CosmicSignature \(ERC721\) transfers/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserStatsSection {...defaultProps} />);
    await checkA11y(container);
  });
});
