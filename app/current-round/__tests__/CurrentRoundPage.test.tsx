import { render, screen, checkA11y } from '@/test-utils';

import CurrentRoundPage from '../CurrentRoundPage';

const mockUseDashboardInfo = jest.fn();
const mockUseBidListByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsNFTByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsCGWithInfoByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsERC20ByRound = jest.fn().mockReturnValue({ data: [] });
const mockUsePrizeTime = jest.fn().mockReturnValue({ data: undefined });
const mockUseCurrentTime = jest.fn().mockReturnValue({ data: undefined });

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useBidListByRound: (...args: unknown[]) => mockUseBidListByRound(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useDonationsCGWithInfoByRound: (...args: unknown[]) => mockUseDonationsCGWithInfoByRound(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  usePrizeTime: (...args: unknown[]) => mockUsePrizeTime(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));

jest.mock('react-countdown', () => ({
  __esModule: true,
  default: ({ date }: { date: number }) => (
    <div data-testid="countdown">countdown-target:{date}</div>
  ),
}));

jest.mock('../../../components/common/Counter', () => ({
  __esModule: true,
  default: () => <div data-testid="counter" />,
}));

jest.mock('../../../components/home/RoundInfoSection', () => ({
  RoundInfoSection: (props: Record<string, unknown>) => (
    <div data-testid="round-info-section" data-round={props.data ? 'loaded' : 'none'}>
      RoundInfoSection
    </div>
  ),
}));

jest.mock('../../../components/tables/SpecialPrizeWinners', () => ({
  SpecialPrizeWinners: () => <div data-testid="special-prize-winners">Special Prizes</div>,
}));

beforeEach(() => jest.clearAllMocks());

const NOW_SEC = Math.floor(Date.now() / 1000);

const baseDashboardData = {
  CurRoundNum: 42,
  CurNumBids: 137,
  TsRoundStart: NOW_SEC - 7200,
  LastBidderAddr: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  PrizeAmountEth: 5.1234,
  RaffleAmountEth: 1.5,
  CosmicGameBalanceEth: 20,
  CharityPercentage: 10,
  BidPriceEth: 0.01,
  StakingAmountEth: 2,
  NumRaffleEthRecipientsBidding: 5,
  NumRaffleNFTRecipientsBidding: 3,
  NumRaffleNFTRecipientsStakingRWalk: 2,
  CurRoundStats: {
    TotalBids: 137,
    TotalDonatedAmountEth: 0.75,
    TotalDonatedNFTs: 4,
  },
  MainStats: {},
};

function setupLoaded(overrides: Record<string, unknown> = {}) {
  const data = { ...baseDashboardData, ...overrides };
  mockUseDashboardInfo.mockReturnValue({ data, isLoading: false, isError: false });
}

describe('CurrentRoundPage', () => {
  it('renders loading spinner while data loads', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<CurrentRoundPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state on API failure', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<CurrentRoundPage />);
    expect(screen.getByText('Failed to load round data')).toBeInTheDocument();
  });

  it('renders error state when data is null', () => {
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false, isError: false });
    render(<CurrentRoundPage />);
    expect(screen.getByText('Failed to load round data')).toBeInTheDocument();
  });

  it('renders round number in heading', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('Cycle #42')).toBeInTheDocument();
  });

  it('renders LIVE badge', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByTestId('live-badge')).toHaveTextContent('Live');
  });

  it('renders bid count in subtitle', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText(/137 gestures made/)).toBeInTheDocument();
  });

  it('renders all 6 stat cards with correct values', () => {
    setupLoaded();
    render(<CurrentRoundPage />);

    expect(screen.getByText('Total Gestures')).toBeInTheDocument();
    expect(screen.getByText('Cycle Reserve')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection Pool')).toBeInTheDocument();
    expect(screen.getByText('Public Goods')).toBeInTheDocument();
    expect(screen.getByText('Contributed ETH')).toBeInTheDocument();
    expect(screen.getByText('Attached NFTs')).toBeInTheDocument();
  });

  it('displays formatted prize pool value', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('5.1234 ETH')).toBeInTheDocument();
  });

  it('displays formatted raffle pool value', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
  });

  it('displays computed charity amount', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('2.0000 ETH')).toBeInTheDocument();
  });

  it('renders countdown timer when prize time is in the future', () => {
    const futureTime = NOW_SEC + 3600;
    setupLoaded();
    mockUsePrizeTime.mockReturnValue({ data: futureTime });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC });
    render(<CurrentRoundPage />);

    expect(screen.getByText('Cycle finalizes in')).toBeInTheDocument();
    expect(screen.getByTestId('countdown')).toBeInTheDocument();
  });

  it('renders "Bids Exhausted" state when countdown has passed', () => {
    const pastTime = NOW_SEC - 60;
    setupLoaded();
    mockUsePrizeTime.mockReturnValue({ data: pastTime });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC });
    render(<CurrentRoundPage />);

    expect(screen.getByText('Cycle Closed')).toBeInTheDocument();
    expect(screen.getByText('Waiting for the cycle to finalize.')).toBeInTheDocument();
  });

  it('does not show countdown or exhausted state when no last bidder', () => {
    setupLoaded({ LastBidderAddr: '0x0000000000000000000000000000000000000000' });
    mockUsePrizeTime.mockReturnValue({ data: NOW_SEC + 3600 });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC });
    render(<CurrentRoundPage />);

    expect(screen.queryByText('Cycle finalizes in')).not.toBeInTheDocument();
    expect(screen.queryByText('Cycle Closed')).not.toBeInTheDocument();
  });

  it('renders last bidder address', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('Last Participant — Current Leader')).toBeInTheDocument();
    expect(screen.getByText(/0xAbCdEf12/)).toBeInTheDocument();
  });

  it('does not show last bidder when address is zero', () => {
    setupLoaded({ LastBidderAddr: '0x0000000000000000000000000000000000000000' });
    render(<CurrentRoundPage />);
    expect(screen.queryByText('Last Participant — Current Leader')).not.toBeInTheDocument();
  });

  it('renders SpecialPrizeWinners in hero when there is a last bidder', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByTestId('special-prize-winners')).toBeInTheDocument();
  });

  it('does not render SpecialPrizeWinners when no last bidder', () => {
    setupLoaded({ LastBidderAddr: '0x0000000000000000000000000000000000000000' });
    render(<CurrentRoundPage />);
    expect(screen.queryByTestId('special-prize-winners')).not.toBeInTheDocument();
  });

  it('renders "Make a Gesture" CTA link', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    const cta = screen.getByRole('link', { name: /Make a Gesture/ });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/');
  });

  it('renders "Back to Home" navigation link', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    const link = screen.getByRole('link', { name: /Back to Home/ });
    expect(link).toHaveAttribute('href', '/');
  });

  it('passes data to RoundInfoSection', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    const section = screen.getByTestId('round-info-section');
    expect(section).toHaveAttribute('data-round', 'loaded');
  });

  it('renders singular bid text for 1 bid', () => {
    setupLoaded({ CurNumBids: 1 });
    render(<CurrentRoundPage />);
    expect(screen.getByText(/1 gesture made/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    setupLoaded();
    mockUsePrizeTime.mockReturnValue({ data: NOW_SEC + 3600 });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC });
    const { container } = render(<CurrentRoundPage />);
    await checkA11y(container);
  }, 15_000);
});
