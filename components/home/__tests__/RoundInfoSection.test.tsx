import { render, screen, checkA11y } from '@/test-utils';

import { RoundInfoSection } from '../RoundInfoSection';

jest.mock('../../common/Prize', () => ({
  __esModule: true,
  default: () => <div data-testid="prize-breakdown">Prize</div>,
}));

jest.mock('../../tokens/FundDistribution', () => ({
  FundDistribution: () => <div data-testid="fund-distribution">Fund Distribution Chart</div>,
}));

jest.mock('../../tables/RaffleHolderTable', () => ({
  __esModule: true,
  default: () => <div data-testid="raffle-holder-table">Raffle</div>,
}));

jest.mock('../../tables/ETHSpentTable', () => ({
  __esModule: true,
  default: () => <div data-testid="eth-spent-table">ETH Spent</div>,
}));

jest.mock('../../tables/EnduranceChampionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="endurance-table">Endurance</div>,
}));

jest.mock('../../tables/BiddingHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="bidding-history">Bids</div>,
}));

jest.mock('../../tables/EthDonationTable', () => ({
  __esModule: true,
  default: () => <div data-testid="eth-donation-table">ETH Donation rows</div>,
}));

jest.mock('../../home/DonatedTokensSection', () => ({
  DonatedTokensSection: () => <div data-testid="donated-tokens">Donated Tokens</div>,
}));

beforeEach(() => jest.clearAllMocks());

const baseData = {
  CurRoundNum: 10,
  CurNumBids: 50,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
  LastBidderAddr: '0xBidder',
  BidPriceEth: 0.01,
  StakingAmountEth: 1,
  NumRaffleEthWinnersBidding: 5,
  NumRaffleNFTWinnersBidding: 3,
  NumRaffleNFTWinnersStakingRWalk: 2,
  PrizePercentage: 25,
  RafflePercentage: 15,
  CharityPercentage: 10,
  StakingPercentage: 10,
  ChronoWarriorPercentage: 5,
  CosmicGameBalanceEth: 20,
  MainStats: {},
};

const defaultProps = {
  data: baseData as never,
  curBidList: [],
  championList: null,
  ethDonations: [] as never[],
  donatedNFTs: [],
  donatedERC20Tokens: [] as never[],
  donatedTokensTab: 0,
  onTabChange: jest.fn(),
  curPage: 1,
  setCurPage: jest.fn(),
  perPage: 12,
};

describe('RoundInfoSection', () => {
  it('renders Prize component when data exists', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('prize-breakdown')).toBeInTheDocument();
  });

  it('does not render Prize when data is null', () => {
    render(<RoundInfoSection {...defaultProps} data={null} />);
    expect(screen.queryByTestId('prize-breakdown')).not.toBeInTheDocument();
  });

  it('renders Fund Distribution chart', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('fund-distribution')).toBeInTheDocument();
  });

  it('renders Raffle Ticket Holders section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('raffle-holder-table')).toBeInTheDocument();
  });

  it('renders Top ETH Spenders section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('eth-spent-table')).toBeInTheDocument();
  });

  it('renders Endurance Champions section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('endurance-table')).toBeInTheDocument();
  });

  it('renders Bid History section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('bidding-history')).toBeInTheDocument();
  });

  it('renders DonatedTokensSection', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('donated-tokens')).toBeInTheDocument();
  });

  it('shows ETH Donations section when donations exist', () => {
    const propsWithDonations = {
      ...defaultProps,
      ethDonations: [{ id: 1 }] as never[],
    };
    render(<RoundInfoSection {...propsWithDonations} />);
    expect(screen.getByTestId('eth-donation-table')).toBeInTheDocument();
  });

  it('hides ETH Donations section when list is empty', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.queryByTestId('eth-donation-table')).not.toBeInTheDocument();
  });

  it('renders collapsible Round Rules section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Round Rules')).toBeInTheDocument();
  });

  it('hides rules content when collapsed (default state)', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.queryByText(/100 Cosmic Tokens/)).not.toBeInTheDocument();
  });

  it('renders round summary footer strip', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('round-summary-footer')).toBeInTheDocument();
    expect(screen.getByText('Contract Balance')).toBeInTheDocument();
    expect(screen.getByText('Round Duration')).toBeInTheDocument();
    expect(screen.getByText('Unique Bidders')).toBeInTheDocument();
  });

  it('displays formatted contract balance in footer', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByText('20.00 ETH')).toBeInTheDocument();
  });

  it('displays unique bidder count in footer', () => {
    const propsWithBids = {
      ...defaultProps,
      curBidList: [
        { BidderAddr: '0xA', TimeStamp: 1 },
        { BidderAddr: '0xB', TimeStamp: 2 },
        { BidderAddr: '0xA', TimeStamp: 3 },
      ] as never[],
    };
    render(<RoundInfoSection {...propsWithBids} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all section titles', () => {
    const propsWithDonations = {
      ...defaultProps,
      ethDonations: [{ id: 1 }] as never[],
    };
    render(<RoundInfoSection {...propsWithDonations} />);

    expect(screen.getByText('Fund Distribution')).toBeInTheDocument();
    expect(screen.getByText('Raffle Ticket Holders')).toBeInTheDocument();
    expect(screen.getByText('Top ETH Spenders')).toBeInTheDocument();
    expect(screen.getByText('Endurance Champions')).toBeInTheDocument();
    expect(screen.getByText(/Bid History/)).toBeInTheDocument();
    expect(screen.getByText('ETH Donations')).toBeInTheDocument();
    expect(screen.getByText('Round Rules')).toBeInTheDocument();
  });

  it('renders sections in correct order (bid history before donations)', () => {
    const propsWithDonations = {
      ...defaultProps,
      ethDonations: [{ id: 1 }] as never[],
    };
    const { container } = render(<RoundInfoSection {...propsWithDonations} />);

    const bidHistory = container.querySelector('[data-testid="bidding-history"]')!;
    const ethDonation = container.querySelector('[data-testid="eth-donation-table"]')!;
    const donatedTokens = container.querySelector('[data-testid="donated-tokens"]')!;

    const allElements = container.querySelectorAll('[data-testid]');
    const order = Array.from(allElements).map((el) => el.getAttribute('data-testid'));

    const bidIdx = order.indexOf('bidding-history');
    const ethDonIdx = order.indexOf('eth-donation-table');
    const donatedIdx = order.indexOf('donated-tokens');

    expect(bidHistory).toBeInTheDocument();
    expect(ethDonation).toBeInTheDocument();
    expect(donatedTokens).toBeInTheDocument();

    expect(bidIdx).toBeLessThan(ethDonIdx);
    expect(bidIdx).toBeLessThan(donatedIdx);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RoundInfoSection {...defaultProps} />);
    await checkA11y(container);
  }, 15_000);
});
