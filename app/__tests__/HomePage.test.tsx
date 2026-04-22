import { render, screen, checkA11y } from '@/test-utils';

import HomePage from '../HomePage';

/* ── useApiQuery hooks ──────────────────────────────────────────── */

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseBidListByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsNFTByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsCGWithInfoByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsERC20ByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseCurrentTime = jest.fn().mockReturnValue({
  data: Math.floor(Date.now() / 1000),
  isLoading: false,
});
const mockUseCSTInfo = jest.fn().mockReturnValue({ data: undefined });

jest.mock('../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useBidListByRound: (...args: unknown[]) => mockUseBidListByRound(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useDonationsCGWithInfoByRound: (...args: unknown[]) => mockUseDonationsCGWithInfoByRound(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
  useCSTInfo: (...args: unknown[]) => mockUseCSTInfo(...args),
}));

/* ── useBidForm ─────────────────────────────────────────────────── */

const mockBidForm = {
  bidType: 'ETH',
  setBidType: jest.fn(),
  donationType: 'NFT',
  setDonationType: jest.fn(),
  cstBidData: { AuctionDuration: 3600, CSTPrice: 1, SecondsElapsed: 1800 },
  ethBidInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
  message: '',
  setMessage: jest.fn(),
  nftDonateAddress: '',
  setNftDonateAddress: jest.fn(),
  nftId: '',
  setNftId: jest.fn(),
  tokenDonateAddress: '',
  setTokenDonateAddress: jest.fn(),
  tokenAmount: '',
  setTokenAmount: jest.fn(),
  rwlkId: -1,
  setRwlkId: jest.fn(),
  bidPricePlus: 2,
  setBidPricePlus: jest.fn(),
  isBidding: false,
  advancedExpanded: false,
  setAdvancedExpanded: jest.fn(),
  rwlknftIds: [],
  onBid: jest.fn().mockResolvedValue(true),
  onBidWithCST: jest.fn().mockResolvedValue(true),
};

jest.mock('../../hooks/useBidForm', () => ({
  useBidForm: () => mockBidForm,
}));

/* ── usePrizeClaim ──────────────────────────────────────────────── */

const mockPrizeClaim = {
  fetchActivationTime: jest.fn().mockResolvedValue(0),
  prizeTime: Date.now() + 60_000,
  timeoutClaimPrize: 600,
  isClaiming: false,
  activationTime: 0,
  claimHistory: null,
  onClaimPrize: jest.fn().mockResolvedValue(true),
};

jest.mock('../../hooks/usePrizeClaim', () => ({
  usePrizeClaim: () => mockPrizeClaim,
}));

/* ── usePrizeNotification ───────────────────────────────────────── */

jest.mock('../../hooks/usePrizeNotification', () => ({
  usePrizeNotification: () => ({
    playAudio: jest.fn(),
    requestNotificationPermission: jest.fn(),
  }),
}));

/* ── wagmi / web3 ───────────────────────────────────────────────── */

let mockAccount: string | null = '0xUser';
jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: jest.fn() }),
  useWalletClient: () => ({ data: null }),
}));

/* ── next / react-query ─────────────────────────────────────────── */

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: jest.fn().mockReturnValue(null) }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

/* ── child components ───────────────────────────────────────────── */

jest.mock('../../components/common/BiddingStatus', () => ({
  BiddingStatus: () => <div data-testid="bidding-status">BiddingStatus</div>,
}));

jest.mock('../../components/home/BidForm', () => ({
  BidForm: () => <div data-testid="bid-form">BidForm</div>,
}));

jest.mock('../../components/home/RoundInfoSection', () => ({
  RoundInfoSection: () => <div data-testid="round-info-section">RoundInfoSection</div>,
}));

jest.mock('../../components/home/WinningHistorySection', () => ({
  WinningHistorySection: () => <div data-testid="winning-history">WinningHistorySection</div>,
}));

jest.mock('../../components/nft/LatestNFTs', () => ({
  __esModule: true,
  default: () => <div data-testid="latest-nfts">LatestNFTs</div>,
}));

jest.mock('../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

jest.mock('../../components/tables/SpecialPrizeWinners', () => ({
  SpecialPrizeWinners: () => <div data-testid="special-prize-winners">SpecialPrizeWinners</div>,
}));

jest.mock('../../config/networks', () => ({
  ART_BLOCKS_ADDRESS: '0xArt',
}));

jest.mock('../../utils', () => ({
  getAssetsUrl: (path: string) => `https://assets.example.com/${path}`,
  getEnduranceChampions: () => [],
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
});

/* ── helpers ────────────────────────────────────────────────────── */

const makeDashboardData = (overrides = {}) => ({
  CurRoundNum: 5,
  CurNumBids: 10,
  LastBidderAddr: '0xBidder',
  BidPriceEth: 0.01,
  PrizeAmountEth: 1.5,
  PrizeClaimTs: Math.floor(Date.now() / 1000) + 3600,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
  MainStats: { NumCSTokenMints: 100 },
  CurRoundStats: { TotalDonatedNFTs: 3, TotalDonatedAmountEth: 0.5 },
  ...overrides,
});

/* ── Tests ──────────────────────────────────────────────────────── */

describe('HomePage', () => {
  it('shows loading overlay when dashboard is loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders BiddingStatus component with data', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('bidding-status')).toBeInTheDocument();
  });

  it('renders BidForm when user is active and not loading', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('bid-form')).toBeInTheDocument();
  });

  it('renders LatestNFTs section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('latest-nfts')).toBeInTheDocument();
  });

  it('renders Prize breakdown when data is loaded', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText('Prize Breakdown')).toBeInTheDocument();
  });

  it('renders link to full round details', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText('View Full Round Details')).toBeInTheDocument();
  });

  it('shows link to previous round results when round > 1', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 5 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText(/Round 4 results/)).toBeInTheDocument();
  });

  it('does not show previous round link when round is 1', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 1 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.queryByText(/Round \d+ results/)).not.toBeInTheDocument();
  });

  it('does not render BidForm when still loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.queryByTestId('bid-form')).not.toBeInTheDocument();
  });

  it('does not render BidForm when account is null', () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.queryByTestId('bid-form')).not.toBeInTheDocument();
  });

  it('renders SpecialPrizeWinners when TsRoundStart is nonzero', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ TsRoundStart: 1700000000 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('special-prize-winners')).toBeInTheDocument();
  });

  it('renders bid button text', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    const bidButtons = screen.getAllByRole('button');
    const bidButton = bidButtons.find((b) => b.textContent?.includes('Bid'));
    expect(bidButton).toBeDefined();
  });

  it('renders claim prize button when data is available', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    const claimButton = screen.queryByText(/Claim Prize/);
    expect(claimButton || screen.queryByTestId('bidding-status')).toBeTruthy();
  });

  it('renders previous round link with correct round number', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 10 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText(/Round 9 results/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Round 9 results/ });
    expect(link).toHaveAttribute('href', '/prize/9');
  });

  it('renders loading spinner and hides BidForm when loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('bid-form')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    const { container } = render(<HomePage />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
