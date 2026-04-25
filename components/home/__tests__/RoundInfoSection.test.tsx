import { render, screen, checkA11y } from '@/test-utils';

import { RoundInfoSection } from '../RoundInfoSection';

jest.mock('../../common/Allocation', () => ({
  __esModule: true,
  default: () => <div data-testid="allocation-breakdown">Signature Allocation</div>,
}));

jest.mock('../../tokens/FundDistribution', () => ({
  FundDistribution: () => <div data-testid="fund-distribution">Fund Distribution Chart</div>,
}));

jest.mock('../../tables/StellarSelectionHolderTable', () => ({
  __esModule: true,
  default: () => <div data-testid="stellar-selection-holder-table">Stellar Selection</div>,
}));

jest.mock('../../tables/ETHSpentTable', () => ({
  __esModule: true,
  default: () => <div data-testid="eth-spent-table">ETH Spent</div>,
}));

jest.mock('../../tables/EnduranceChampionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="endurance-table">Endurance</div>,
}));

jest.mock('../../tables/GestureHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="gesture-history">Gestures</div>,
}));

jest.mock('../../tables/EthDonationTable', () => ({
  __esModule: true,
  default: () => <div data-testid="eth-contribution-table">ETH Contribution rows</div>,
}));

jest.mock('../../home/DonatedTokensSection', () => ({
  DonatedTokensSection: () => <div data-testid="attached-tokens">Attached Tokens</div>,
}));

beforeEach(() => jest.clearAllMocks());

const baseData = {
  CurRoundNum: 10,
  CurNumBids: 50,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
  LastBidderAddr: '0xBidder',
  GestureCostEth: 0.01,
  StakingAmountEth: 1,
  NumRaffleEthRecipientsBidding: 5,
  NumRaffleNFTRecipientsBidding: 3,
  NumRaffleNFTRecipientsStakingRWalk: 2,
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
  curGestureList: [],
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
  it('renders Allocation component when data exists', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('allocation-breakdown')).toBeInTheDocument();
  });

  it('does not render Allocation when data is null', () => {
    render(<RoundInfoSection {...defaultProps} data={null} />);
    expect(screen.queryByTestId('allocation-breakdown')).not.toBeInTheDocument();
  });

  it('renders Fund Distribution chart', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('fund-distribution')).toBeInTheDocument();
  });

  it('renders Stellar Selection Entries section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('stellar-selection-holder-table')).toBeInTheDocument();
  });

  it('renders Top ETH Spenders section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('eth-spent-table')).toBeInTheDocument();
  });

  it('renders Endurance Champions section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('endurance-table')).toBeInTheDocument();
  });

  it('renders Gesture History section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('gesture-history')).toBeInTheDocument();
  });

  it('renders DonatedTokensSection', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('attached-tokens')).toBeInTheDocument();
  });

  it('shows ETH Contributions section when contributions exist', () => {
    const propsWithDonations = {
      ...defaultProps,
      ethDonations: [{ id: 1 }] as never[],
    };
    render(<RoundInfoSection {...propsWithDonations} />);
    expect(screen.getByTestId('eth-contribution-table')).toBeInTheDocument();
  });

  it('hides ETH Contributions section when list is empty', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.queryByTestId('eth-contribution-table')).not.toBeInTheDocument();
  });

  it('renders collapsible Cycle Rules section', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText('Cycle Rules')).toBeInTheDocument();
  });

  it('hides rules content when collapsed (default state)', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.queryByText(/100 Cosmic Tokens/)).not.toBeInTheDocument();
  });

  it('renders round summary footer strip', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByTestId('round-summary-footer')).toBeInTheDocument();
    expect(screen.getByText('Contract Balance')).toBeInTheDocument();
    expect(screen.getByText('Cycle Duration')).toBeInTheDocument();
    expect(screen.getByText('Unique Participants')).toBeInTheDocument();
  });

  it('displays formatted contract balance in footer', () => {
    render(<RoundInfoSection {...defaultProps} />);
    expect(screen.getByText('20.00 ETH')).toBeInTheDocument();
  });

  it('displays unique participant count in footer', () => {
    const propsWithGestures = {
      ...defaultProps,
      curGestureList: [
        { BidderAddr: '0xA', TimeStamp: 1 },
        { BidderAddr: '0xB', TimeStamp: 2 },
        { BidderAddr: '0xA', TimeStamp: 3 },
      ] as never[],
    };
    render(<RoundInfoSection {...propsWithGestures} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all section titles', () => {
    const propsWithDonations = {
      ...defaultProps,
      ethDonations: [{ id: 1 }] as never[],
    };
    render(<RoundInfoSection {...propsWithDonations} />);

    expect(screen.getByText('Allocation Tracks')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection Entries')).toBeInTheDocument();
    expect(screen.getByText('Top ETH Spenders')).toBeInTheDocument();
    expect(screen.getByText('Endurance Champions')).toBeInTheDocument();
    expect(screen.getByText(/Gesture History/)).toBeInTheDocument();
    expect(screen.getByText('ETH Contributions')).toBeInTheDocument();
    expect(screen.getByText('Cycle Rules')).toBeInTheDocument();
  });

  it('renders sections in correct order (gesture history before contributions)', () => {
    const propsWithDonations = {
      ...defaultProps,
      ethDonations: [{ id: 1 }] as never[],
    };
    const { container } = render(<RoundInfoSection {...propsWithDonations} />);

    const gestureHistory = container.querySelector('[data-testid="gesture-history"]')!;
    const ethDonation = container.querySelector('[data-testid="eth-contribution-table"]')!;
    const donatedTokens = container.querySelector('[data-testid="attached-tokens"]')!;

    const allElements = container.querySelectorAll('[data-testid]');
    const order = Array.from(allElements).map((el) => el.getAttribute('data-testid'));

    const gestureIdx = order.indexOf('gesture-history');
    const ethDonIdx = order.indexOf('eth-contribution-table');
    const donatedIdx = order.indexOf('attached-tokens');

    expect(gestureHistory).toBeInTheDocument();
    expect(ethDonation).toBeInTheDocument();
    expect(donatedTokens).toBeInTheDocument();

    expect(gestureIdx).toBeLessThan(ethDonIdx);
    expect(gestureIdx).toBeLessThan(donatedIdx);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RoundInfoSection {...defaultProps} />);
    await checkA11y(container);
  }, 15_000);
});
