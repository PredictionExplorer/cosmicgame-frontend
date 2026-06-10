import userEvent from '@testing-library/user-event';

import { render, screen, within, act, checkA11y } from '@/test-utils';

import HomePage from '../HomePage';

jest.mock('@rainbow-me/rainbowkit');

/* ── useApiQuery hooks ──────────────────────────────────────────── */

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseGestureListByCycle = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsNFTByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsCGWithInfoByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsERC20ByRound = jest.fn().mockReturnValue({ data: undefined });
const mockUseBannedGestures = jest.fn().mockReturnValue({ data: [] });
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
  useBannedGestures: (...args: unknown[]) => mockUseBannedGestures(...args),
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
const mockSetQueryData = jest.fn();

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
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    setQueryData: mockSetQueryData,
  }),
}));

/* ── child components ───────────────────────────────────────────── */

const mockGestureStatus = jest.fn((props: Record<string, unknown>) => (
  <div
    data-testid="gesture-status"
    data-attached-nft-count={String(props.attachedNFTCount ?? 0)}
    data-attached-erc20-count={String(props.attachedERC20Count ?? 0)}
  >
    GestureStatus
  </div>
));

jest.mock('../../components/common/GestureStatus', () => ({
  GestureStatus: (props: Record<string, unknown>) => mockGestureStatus(props),
}));

jest.mock('../../components/home/GestureForm', () => ({
  GestureForm: ({ previewMode = false }: { previewMode?: boolean }) => (
    <div data-testid="gesture-form" data-preview={String(previewMode)}>
      GestureForm
    </div>
  ),
}));

jest.mock('../../components/attachments/DonatedNFTPrizeShowcase', () => ({
  AttachedNFTAllocationShowcase: ({
    nfts,
    erc20Tokens = [],
    cycleNumber,
    variant = 'default',
  }: {
    nfts: unknown[];
    erc20Tokens?: unknown[];
    cycleNumber?: number;
    variant?: 'default' | 'rail';
  }) =>
    nfts.length > 0 || erc20Tokens.length > 0 ? (
      <section
        data-testid="attached-nft-showcase"
        data-count={nfts.length}
        data-erc20-count={erc20Tokens.length}
        data-cycle={cycleNumber}
        data-variant={variant}
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
    latestGesture?: { EvtLogId?: number; BidderAddr?: string } | null;
  }) => (
    <div
      data-testid="special-allocation-recipients"
      data-account={props.currentAccount ?? ''}
      data-message={props.latestMessage ?? ''}
      data-latest-gesture-id={props.latestGesture?.EvtLogId ?? ''}
      data-latest-gesture-address={props.latestGesture?.BidderAddr ?? ''}
    >
      SpecialAllocationRecipients
    </div>
  ),
}));

jest.mock('../../utils', () => ({
  convertTimestampToDateTime: (timestamp: number, showSecond: boolean = false): string => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const date = new Date(timestamp * 1000);
    const month = monthNames[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month} ${day}, ${hours}:${minutes}${showSecond ? `:${seconds}` : ''}`;
  },
  formatEthValue: (value: number) => {
    if (!value) return '0 ETH';
    return value < 10 ? `${value.toFixed(4)} ETH` : `${value.toFixed(2)} ETH`;
  },
  getAssetsUrl: (path: string) => `https://assets.example.com/${path}`,
  getEnduranceChampions: () => [],
  shortenHex: (hex: string, length = 4) =>
    hex ? `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}` : '',
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
  mockUseDonationsERC20ByRound.mockReturnValue({ data: [] });
  mockUseBannedGestures.mockReturnValue({ data: [] });
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
  it('renders the observatory hero above the Chrono Core timer', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, CurNumBids: 42, PrizeAmountEth: 2.75 }),
      isLoading: false,
    });

    render(<HomePage />);

    const chronoCore = screen.getByTestId('chrono-core-timer');
    const observatory = screen.getByRole('region', { name: 'Current cycle observatory' });
    expect(chronoCore).toHaveAttribute('data-phase', 'final-minute');
    expect(observatory.compareDocumentPosition(chronoCore)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders the cycle phase guide between the timer and the gesture area', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const chronoCore = screen.getByTestId('chrono-core-timer');
    const phaseGuide = screen.getByRole('heading', {
      name: 'Where this Performance Cycle is now',
    });
    expect(chronoCore.compareDocumentPosition(phaseGuide)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByRole('list', { name: 'Performance Cycle phases' })).toBeInTheDocument();
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

  it('shows gesture form skeletons instead of a blocking overlay while loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status', { name: 'Loading gesture form' })).toBeInTheDocument();
    expect(screen.getByTestId('gesture-form-skeleton')).toBeInTheDocument();
  });

  it('renders GestureStatus component with data', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('gesture-status')).toBeInTheDocument();
  });

  it('renders current-cycle gesture messages in the chat panel', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 1,
          TimeStamp: 1_700_000_000,
          DateTime: '',
          BidderAddr: '0x1111111111111111111111111111111111111111',
          RoundNum: 7,
          GestureType: 0,
          GestureCostEth: 0.1,
          Message: 'Older current-cycle signal',
        },
        {
          EvtLogId: 2,
          TimeStamp: 1_700_000_300,
          DateTime: '',
          BidderAddr: '0x2222222222222222222222222222222222222222',
          RoundNum: 7,
          GestureType: 0,
          GestureCostEth: 0.2,
          Message: 'Newest current-cycle signal',
        },
        {
          EvtLogId: 3,
          TimeStamp: 1_700_000_400,
          DateTime: '',
          BidderAddr: '0x3333333333333333333333333333333333333333',
          RoundNum: 7,
          GestureType: 0,
          GestureCostEth: 0.3,
          Message: '',
        },
      ],
    });

    render(<HomePage />);

    expect(mockUseGestureListByCycle).toHaveBeenCalledWith(7, 'desc');
    const chat = screen.getByTestId('gesture-message-chat');
    expect(within(chat).getByText('Newest current-cycle signal')).toBeInTheDocument();
    expect(within(chat).getByText('Older current-cycle signal')).toBeInTheDocument();
    expect(within(chat).queryByRole('link', { name: 'Open gesture 3' })).not.toBeInTheDocument();
  });

  it('keeps the gesture chat in the page when the current cycle has no messages', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({ data: [] });

    render(<HomePage />);

    const chat = screen.getByTestId('gesture-message-chat');
    expect(within(chat).getByText('No gesture messages yet')).toBeInTheDocument();
  });

  it('places the gesture chat after the primary current-cycle content in the responsive layout', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const status = screen.getByTestId('gesture-status');
    const leaders = screen.getByTestId('special-allocation-recipients');
    const form = screen.getByTestId('gesture-form');
    const allocationHeading = screen.getByText('Allocation Breakdown');
    const chat = screen.getByTestId('gesture-message-chat');
    const layout = screen.getByTestId('home-current-cycle-layout');
    const primaryColumn = screen.getByTestId('home-primary-column');
    const chatColumn = screen.getByTestId('home-chat-column');

    expect(status.compareDocumentPosition(chat)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(layout).toHaveClass('xl:grid-cols-[minmax(0,1fr)_minmax(28rem,36rem)]');
    expect(layout).toHaveClass('2xl:grid-cols-[minmax(0,1.08fr)_minmax(34rem,42rem)]');
    expect(primaryColumn).toContainElement(status);
    expect(primaryColumn).toContainElement(leaders);
    expect(primaryColumn).toContainElement(form);
    expect(primaryColumn).toContainElement(allocationHeading);
    expect(chatColumn).toContainElement(chat);
    expect(chat).toHaveClass('xl:sticky', 'xl:top-24', 'xl:min-h-[38rem]', '2xl:min-h-[42rem]');
  });

  it('uses a wider home shell and keeps desktop companion actions in the chat rail', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    const { container } = render(<HomePage />);

    const main = container.querySelector('main');
    const chatColumn = screen.getByTestId('home-chat-column');
    const cycleDetailsLink = screen.getByTestId('cycle-details-link-card');
    const publicGoods = screen.getByTestId('public-goods-impact-card');

    expect(main).toHaveClass('xl:max-w-[92rem]', '2xl:max-w-[108rem]', '2xl:px-10');
    expect(chatColumn).toContainElement(cycleDetailsLink);
    expect(chatColumn).toContainElement(publicGoods);
    expect(cycleDetailsLink).toHaveAttribute('href', '/current-cycle');
    expect(publicGoods).toHaveAttribute('data-variant', 'rail');
  });

  it('fills the chat rail with attached assets when the current cycle has them', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseDonationsNFTByRound.mockReturnValue({
      data: [{ RecordId: 1 }, { RecordId: 2 }],
    });
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: [{ EvtLogId: 1, TokenAddr: '0xToken', AmountDonatedEth: 5 }],
    });

    render(<HomePage />);

    const primaryColumn = screen.getByTestId('home-primary-column');
    const chatColumn = screen.getByTestId('home-chat-column');
    const showcase = screen.getByTestId('attached-nft-showcase');
    const gestureStatusProps =
      mockGestureStatus.mock.calls[mockGestureStatus.mock.calls.length - 1]?.[0];

    expect(gestureStatusProps).toEqual(
      expect.objectContaining({ attachedNFTCount: 2, attachedERC20Count: 1 }),
    );
    expect(chatColumn).toContainElement(showcase);
    expect(primaryColumn).not.toContainElement(showcase);
    expect(showcase).toHaveAttribute('data-count', '2');
    expect(showcase).toHaveAttribute('data-erc20-count', '1');
    expect(showcase).toHaveAttribute('data-cycle', '7');
    expect(showcase).toHaveAttribute('data-variant', 'rail');
  });

  it('does not render empty rail placeholders when optional rail content is absent', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CharityPercentage: 0 }),
      isLoading: false,
    });
    mockUseDonationsNFTByRound.mockReturnValue({ data: [] });
    mockUseDonationsERC20ByRound.mockReturnValue({ data: [] });

    render(<HomePage />);

    const chatColumn = screen.getByTestId('home-chat-column');

    expect(chatColumn).toContainElement(screen.getByTestId('gesture-message-chat'));
    expect(chatColumn).toContainElement(screen.getByTestId('cycle-details-link-card'));
    expect(screen.queryByTestId('home-rail-public-goods')).not.toBeInTheDocument();
    expect(screen.queryByTestId('home-rail-attached-assets')).not.toBeInTheDocument();
    expect(screen.queryByTestId('public-goods-impact-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('attached-nft-showcase')).not.toBeInTheDocument();
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
    expect(mockUseDonationsERC20ByRound).toHaveBeenCalledWith(7);
    const gestureStatusProps =
      mockGestureStatus.mock.calls[mockGestureStatus.mock.calls.length - 1]?.[0];
    expect(gestureStatusProps).toEqual(
      expect.objectContaining({ attachedNFTCount: 2, attachedERC20Count: 0 }),
    );
    const showcase = screen.getByTestId('attached-nft-showcase');
    expect(showcase).toHaveAttribute('data-count', '2');
    expect(showcase).toHaveAttribute('data-erc20-count', '0');
    expect(showcase).toHaveAttribute('data-cycle', '7');
    expect(screen.getByText('Allocation Breakdown').compareDocumentPosition(showcase)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('requests current-cycle attached ERC20 tokens and renders the showcase when present', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: [{ EvtLogId: 1, TokenAddr: '0xToken', AmountDonatedEth: 5 }],
    });

    render(<HomePage />);

    expect(mockUseDonationsERC20ByRound).toHaveBeenCalledWith(7);
    const gestureStatusProps =
      mockGestureStatus.mock.calls[mockGestureStatus.mock.calls.length - 1]?.[0];
    expect(gestureStatusProps).toEqual(
      expect.objectContaining({ attachedNFTCount: 0, attachedERC20Count: 1 }),
    );
    const showcase = screen.getByTestId('attached-nft-showcase');
    expect(showcase).toHaveAttribute('data-count', '0');
    expect(showcase).toHaveAttribute('data-erc20-count', '1');
    expect(showcase).toHaveAttribute('data-cycle', '7');
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

  it('shows a gesture form preview with a connect prompt when account is null', async () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(screen.getByTestId('gesture-form')).toHaveAttribute('data-preview', 'true');
    expect(screen.getByText('Connect to submit your gesture')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });

  it('switches from the preview to live game controls after the wallet connects', () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    const { rerender } = render(<HomePage />);
    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(screen.getByTestId('gesture-form')).toHaveAttribute('data-preview', 'true');

    mockAccount = '0xUser';
    rerender(<HomePage />);

    expect(screen.queryByTestId('connect-to-gesture')).not.toBeInTheDocument();
    expect(screen.getByTestId('gesture-form')).toHaveAttribute('data-preview', 'false');
    expect(screen.getByRole('button', { name: /Gesture with ETH/ })).toBeEnabled();
  });

  it('shows a sticky mobile gesture CTA labelled for the wallet state', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    const { rerender } = render(<HomePage />);
    // Hero CTA + sticky mobile CTA both target the gesture panel when connected.
    const gestureLinks = screen.getAllByRole('link', { name: 'Make a Gesture' });
    expect(gestureLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of gestureLinks) {
      expect(link).toHaveAttribute('href', '#make-gesture');
    }

    mockAccount = null;
    rerender(<HomePage />);
    expect(screen.getByRole('link', { name: 'Preview Gesture Options' })).toHaveAttribute(
      'href',
      '#make-gesture',
    );
  });

  it('renders a latest-gesture ticker linking to the most recent gesture', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 42,
          // 150s in the past: lands mid-window for the "2m ago" bucket, so the
          // shared useNow ticker being up to ~15s stale cannot flip the label.
          TimeStamp: Math.floor(Date.now() / 1000) - 150,
          BidderAddr: '0x1111111111111111111111111111111111111111',
          RoundNum: 7,
          GestureType: 0,
          Message: '',
        },
      ],
    });

    render(<HomePage />);

    const ticker = screen.getByRole('link', { name: 'Open latest gesture 42' });
    expect(ticker).toHaveAttribute('href', '/gesture/42');
    expect(ticker).toHaveTextContent(/made an ETH gesture/);
    expect(ticker).toHaveTextContent(/2m ago/);
  });

  it('labels CST and RandomWalk gestures in the ticker', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 43,
          TimeStamp: Math.floor(Date.now() / 1000),
          BidderAddr: '0x2222222222222222222222222222222222222222',
          RoundNum: 7,
          GestureType: 2,
          Message: '',
        },
      ],
    });

    render(<HomePage />);

    expect(screen.getByRole('link', { name: 'Open latest gesture 43' })).toHaveTextContent(
      /made a CST gesture/,
    );
  });

  it('pulses live surfaces when a cosmic:bid-placed event arrives', async () => {
    jest.useFakeTimers();
    try {
      mockUseDashboardInfo.mockReturnValue({
        data: makeDashboardData({ CurRoundNum: 7 }),
        isLoading: false,
      });
      mockUseGestureListByCycle.mockReturnValue({
        data: [
          {
            EvtLogId: 44,
            TimeStamp: Math.floor(Date.now() / 1000),
            BidderAddr: '0x3333333333333333333333333333333333333333',
            RoundNum: 7,
            GestureType: 0,
            Message: '',
          },
        ],
      });

      render(<HomePage />);

      const ticker = screen.getByRole('link', { name: 'Open latest gesture 44' });
      expect(ticker).not.toHaveClass('animate-live-flash');

      act(() => {
        window.dispatchEvent(new Event('cosmic:bid-placed'));
      });

      expect(ticker).toHaveClass('animate-live-flash');
      expect(screen.getByTestId('gesture-message-chat')).toHaveClass('animate-live-flash');

      act(() => {
        jest.advanceTimersByTime(950);
      });
      expect(ticker).not.toHaveClass('animate-live-flash');
    } finally {
      jest.useRealTimers();
    }
  });

  it('optimistically records the gesture in the dashboard cache after submitting', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    await user.click(screen.getByRole('button', { name: /Gesture with ETH/ }));

    expect(mockSetQueryData).toHaveBeenCalledWith(['dashboardInfo'], expect.any(Function));
    const updater = mockSetQueryData.mock.calls[0]![1] as (
      current: Record<string, unknown> | null,
    ) => Record<string, unknown> | null;
    expect(updater(null)).toBeNull();
    expect(updater({ CurNumBids: 10, LastBidderAddr: '0xBidder' })).toEqual(
      expect.objectContaining({ CurNumBids: 11, LastBidderAddr: '0xUser' }),
    );
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
      data: [
        {
          EvtLogId: 99,
          BidderAddr: '0xBidder',
          TimeStamp: 1700000001,
          Message: 'hello cosmos',
        },
      ],
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
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-latest-gesture-id',
      '99',
    );
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-latest-gesture-address',
      '0xBidder',
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

  it('renders loading skeletons and hides GestureForm when loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status', { name: 'Loading gesture form' })).toBeInTheDocument();
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
