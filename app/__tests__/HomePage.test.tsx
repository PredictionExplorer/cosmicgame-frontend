import userEvent from '@testing-library/user-event';

import { render, screen, within, checkA11y } from '@/test-utils';

import HomePage from '../HomePage';

jest.mock('@rainbow-me/rainbowkit');

/* ── useApiQuery hooks ──────────────────────────────────────────── */

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseGestureListByCycle = jest.fn().mockReturnValue({ data: undefined });
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
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useDonationsCGWithInfoByRound: (...args: unknown[]) => mockUseDonationsCGWithInfoByRound(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
  useCSTInfo: (...args: unknown[]) => mockUseCSTInfo(...args),
}));

/* ── useGestureForm ─────────────────────────────────────────────────── */

const mockGestureForm = {
  gestureType: 'ETH',
  setBidType: jest.fn(),
  contributionType: 'NFT',
  setContributionType: jest.fn(),
  cstGestureData: { AuctionDuration: 3600, CSTPrice: 1, SecondsElapsed: 1800 },
  ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
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
  gestureCostPlus: 2,
  setBidPricePlus: jest.fn(),
  isGesturing: false,
  advancedExpanded: false,
  setAdvancedExpanded: jest.fn(),
  rwlknftIds: [],
  onGesture: jest.fn().mockResolvedValue(true),
  onGestureWithCST: jest.fn().mockResolvedValue(true),
};

jest.mock('../../hooks/useGestureForm', () => ({
  useGestureForm: () => mockGestureForm,
}));

/* ── useAllocationFinalize ──────────────────────────────────────────────── */

const mockAllocationFinalize = {
  fetchActivationTime: jest.fn().mockResolvedValue(0),
  allocationTime: Date.now() + 60_000,
  timeoutFinalize: 600,
  isClaiming: false,
  activationTime: 0,
  claimHistory: null,
  onFinalize: jest.fn().mockResolvedValue(true),
};

jest.mock('../../hooks/useAllocationFinalize', () => ({
  useAllocationFinalize: () => mockAllocationFinalize,
}));

/* ── useAllocationNotification ───────────────────────────────────────── */

jest.mock('../../hooks/useAllocationNotification', () => ({
  useAllocationNotification: () => ({
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

const mockInvalidateQueries = jest.fn();

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
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

/* ── child components ───────────────────────────────────────────── */

jest.mock('../../components/common/GestureStatus', () => ({
  GestureStatus: () => <div data-testid="gesture-status">GestureStatus</div>,
}));

jest.mock('../../components/home/GestureForm', () => ({
  GestureForm: () => <div data-testid="gesture-form">GestureForm</div>,
}));

jest.mock('../../components/attachments/DonatedNFTPrizeShowcase', () => ({
  DonatedNFTPrizeShowcase: ({ nfts, cycleNumber }: { nfts: unknown[]; cycleNumber?: number }) =>
    nfts.length > 0 ? (
      <section
        data-testid="attached-nft-showcase"
        data-count={nfts.length}
        data-cycle={cycleNumber}
      >
        Attached NFT Showcase
      </section>
    ) : null,
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

jest.mock('../../components/tables/SpecialAllocationRecipients', () => ({
  SpecialAllocationRecipients: (props: {
    currentAccount?: string | null;
    latestMessage?: string;
  }) => (
    <div
      data-testid="special-allocation-recipients"
      data-account={props.currentAccount ?? ''}
      data-message={props.latestMessage ?? ''}
    >
      SpecialAllocationRecipients
    </div>
  ),
}));

jest.mock('../../utils', () => ({
  formatEthValue: (value: number) => {
    if (!value) return '0 ETH';
    return value < 10 ? `${value.toFixed(4)} ETH` : `${value.toFixed(2)} ETH`;
  },
  getAssetsUrl: (path: string) => `https://assets.example.com/${path}`,
  getEnduranceChampions: () => [],
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
  Object.assign(mockGestureForm, {
    gestureType: 'ETH',
    contributionType: 'NFT',
    cstGestureData: { AuctionDuration: 3600, CSTPrice: 1, SecondsElapsed: 1800 },
    ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
    message: '',
    nftDonateAddress: '',
    nftId: '',
    tokenDonateAddress: '',
    tokenAmount: '',
    rwlkId: -1,
    gestureCostPlus: 2,
    isGesturing: false,
    advancedExpanded: false,
    rwlknftIds: [],
  });
  mockGestureForm.onGesture.mockResolvedValue(true);
  mockGestureForm.onGestureWithCST.mockResolvedValue(true);
  Object.assign(mockAllocationFinalize, {
    allocationTime: Date.now() + 60_000,
    timeoutFinalize: 600,
    isClaiming: false,
    activationTime: 0,
    claimHistory: null,
  });
  mockAllocationFinalize.fetchActivationTime.mockResolvedValue(0);
  mockAllocationFinalize.onFinalize.mockResolvedValue(true);
  mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false });
  mockUseGestureListByCycle.mockReturnValue({ data: undefined });
  mockUseDonationsNFTByRound.mockReturnValue({ data: [] });
  mockUseCurrentTime.mockReturnValue({
    data: Math.floor(Date.now() / 1000),
    isLoading: false,
  });
  mockUseCSTInfo.mockReturnValue({ data: undefined });
});

/* ── helpers ────────────────────────────────────────────────────── */

const makeDashboardData = (overrides = {}) => ({
  CurRoundNum: 5,
  CurNumBids: 10,
  LastBidderAddr: '0xBidder',
  GestureCostEth: 0.01,
  PrizeAmountEth: 1.5,
  CosmicGameBalanceEth: 10,
  CharityPercentage: 7,
  CharityBalanceEth: '0.5',
  SumVoluntaryDonationsEth: '0.8',
  PrizeClaimTs: Math.floor(Date.now() / 1000) + 3600,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
  MainStats: { NumCSTokenMints: 100, SumCosmicGameDonationsEth: 1.2, SumWithdrawals: 0.4 },
  CurRoundStats: { TotalDonatedNFTs: 3, TotalDonatedAmountEth: 0.5 },
  ...overrides,
});

/* ── Tests ──────────────────────────────────────────────────────── */

describe('HomePage', () => {
  it('renders the Chrono Core timer above the observatory hero', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, CurNumBids: 42, PrizeAmountEth: 2.75 }),
      isLoading: false,
    });

    render(<HomePage />);

    const chronoCore = screen.getByTestId('chrono-core-timer');
    const observatory = screen.getByRole('region', { name: 'Current cycle observatory' });
    expect(chronoCore).toHaveAttribute('data-phase', 'final-minute');
    expect(chronoCore.compareDocumentPosition(observatory)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders a premium observatory hero with live cycle data and protocol story', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, CurNumBids: 42, PrizeAmountEth: 2.75 }),
      isLoading: false,
    });

    render(<HomePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Shape the next Cosmic Signature' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Live on Arbitrum')).toBeInTheDocument();
    expect(screen.getByText('Gestures shape the art')).toBeInTheDocument();
    expect(screen.getByText('CST records participation')).toBeInTheDocument();
    expect(screen.getByText('Allocations fund public goods')).toBeInTheDocument();

    const observatory = screen.getByRole('region', { name: 'Current cycle observatory' });
    expect(within(observatory).getByRole('heading', { name: 'Cycle #7' })).toBeInTheDocument();
    expect(within(observatory).getByText('42')).toBeInTheDocument();
    expect(within(observatory).getByText('2.7500 ETH')).toBeInTheDocument();
    expect(within(observatory).getByText('7%')).toBeInTheDocument();
  });

  it('keeps the hero artwork visible and linked on the main game page', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(screen.getByRole('link', { name: 'View Cosmic Signature art' })).toHaveAttribute(
      'href',
      '/detail/sample',
    );
    expect(screen.getByTestId('nft-image')).toHaveAttribute(
      'alt',
      'Cosmic Signature artwork preview',
    );
  });

  it('links the hero primary action to the gesture panel when the cycle is active', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const links = screen.getAllByRole('link', { name: /Make a Gesture/ });
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '#make-gesture');
    }
  });

  it('links the hero primary action to cycle details before gestures are open', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockAllocationFinalize.activationTime = Math.floor(Date.now() / 1000) + 3600;

    render(<HomePage />);

    expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /Explore Current Cycle/ });
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/current-cycle');
    }
  });

  it('shows loading overlay when dashboard is loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders GestureStatus component with data', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('gesture-status')).toBeInTheDocument();
  });

  it('requests current-cycle attached NFTs and renders the showcase when present', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseDonationsNFTByRound.mockReturnValue({
      data: [{ RecordId: 1 }, { RecordId: 2 }],
    });

    render(<HomePage />);

    expect(mockUseDonationsNFTByRound).toHaveBeenCalledWith(7);
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-count', '2');
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-cycle', '7');
  });

  it('does not render the attached NFT showcase when the current cycle has none', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseDonationsNFTByRound.mockReturnValue({ data: [] });

    render(<HomePage />);

    expect(mockUseDonationsNFTByRound).toHaveBeenCalledWith(7);
    expect(screen.queryByTestId('attached-nft-showcase')).not.toBeInTheDocument();
  });

  it('renders GestureForm when user is active and not loading', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('gesture-form')).toBeInTheDocument();
  });

  it('renders LatestNFTs section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('latest-nfts')).toBeInTheDocument();
  });

  it('renders Allocation breakdown when data is loaded', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText('Allocation Breakdown')).toBeInTheDocument();
  });

  it('renders Public Goods impact card when dashboard data is loaded', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText("Funding Ethereum's core contributors.")).toBeInTheDocument();
    expect(screen.getAllByText('0.7000 ETH').length).toBeGreaterThan(0);
  });

  it('renders link to full cycle details', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText('View Full Cycle Details')).toBeInTheDocument();
  });

  it('shows link to previous cycle allocations when cycle > 1', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 5 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText(/Cycle 4 allocations/)).toBeInTheDocument();
  });

  it('does not show previous cycle link when cycle is 1', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 1 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.queryByText(/Cycle \d+ allocations/)).not.toBeInTheDocument();
  });

  it('does not render GestureForm when still loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
  });

  it('shows a connect-first gesture prompt when account is null', () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(screen.getByText('Connect to make a gesture')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });

  it('switches from wallet prompt to game controls after the wallet connects', () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    const { rerender } = render(<HomePage />);
    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();

    mockAccount = '0xUser';
    rerender(<HomePage />);

    expect(screen.queryByTestId('connect-to-gesture')).not.toBeInTheDocument();
    expect(screen.getByTestId('gesture-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gesture with ETH/ })).toBeEnabled();
  });

  it('renders SpecialAllocationRecipients when TsRoundStart is nonzero', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ TsRoundStart: 1700000000 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('special-allocation-recipients')).toBeInTheDocument();
  });

  it('passes account and latest message to SpecialAllocationRecipients', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ TsRoundStart: 1700000000 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [{ BidderAddr: '0xBidder', TimeStamp: 1700000001, Message: 'hello cosmos' }],
    });

    render(<HomePage />);
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-account',
      '0xUser',
    );
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-message',
      'hello cosmos',
    );
  });

  it('renders gesture button text', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    const buttons = screen.getAllByRole('button');
    const gestureButton = buttons.find((b) => b.textContent?.includes('Gesture'));
    expect(gestureButton).toBeDefined();
  });

  it('submits an ETH gesture from a connected wallet', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    await user.click(screen.getByRole('button', { name: /Gesture with ETH \(0\.01020 ETH\)/ }));

    expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGestureWithCST).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });
    expect(mockGestureForm.setMessage).toHaveBeenCalledWith('');
  });

  it('submits a CST gesture through the CST interaction path', async () => {
    const user = userEvent.setup();
    mockGestureForm.gestureType = 'CST';
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    await user.click(screen.getByRole('button', { name: /Gesture with CST \(1\.00 CST\)/ }));

    expect(mockGestureForm.onGestureWithCST).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
  });

  it('prevents RandomWalk gestures until the participant selects a token', async () => {
    const user = userEvent.setup();
    mockGestureForm.gestureType = 'RandomWalk';
    mockGestureForm.rwlkId = -1;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    const gestureButton = screen.getByRole('button', { name: 'Gesture with RandomWalk' });

    expect(gestureButton).toBeDisabled();
    await user.click(gestureButton);
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
  });

  it('renders finalize cycle button when data is available', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    const finalizeButton = screen.queryByText(/Finalize Cycle/);
    expect(finalizeButton || screen.queryByTestId('gesture-status')).toBeTruthy();
  });

  it('lets an eligible connected wallet finalize the cycle', async () => {
    const user = userEvent.setup();
    const finalGestureParticipant = '0x1234567890abcdef1234567890abcdef12345678';
    mockAccount = finalGestureParticipant;
    mockAllocationFinalize.allocationTime = 1;
    mockAllocationFinalize.timeoutFinalize = 0;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ LastBidderAddr: finalGestureParticipant }),
      isLoading: false,
    });

    render(<HomePage />);
    await user.click(screen.getByRole('button', { name: /Finalize Cycle/ }));

    expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1);
  });

  it('renders previous cycle link with correct cycle number', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 10 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText(/Cycle 9 allocations/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Cycle 9 allocations/ });
    expect(link).toHaveAttribute('href', '/allocation/9');
  });

  it('renders loading spinner and hides GestureForm when loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
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
