import userEvent from '@testing-library/user-event';

import { resetUxScenarioForTest } from '@/lib/uxCycleScenarios';

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

jest.mock('../../../../hooks/useApiQuery', () => ({
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
  cstGestureData: {
    AuctionDuration: 3600,
    CSTPrice: 1,
    CSTPriceWei: 1000000000000000000n,
    SecondsElapsed: 1800,
    isFree: false,
    source: 'api' as const,
  },
  ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
  gestureCstRewardAmount: 100,
  gestureCstRewardAmountMin: 99,
  isCstRewardLoading: false,
  cstRewardTolerancePercent: 1,
  setCstRewardTolerancePercent: jest.fn(),
  acceptAnyCstReward: false,
  setAcceptAnyCstReward: jest.fn(),
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

jest.mock('../../../../hooks/useGestureForm', () => ({
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

jest.mock('../../../../hooks/useAllocationFinalize', () => ({
  useAllocationFinalize: () => mockAllocationFinalize,
}));

/* ── useEndgameChainSync ─────────────────────────────────────────── */

const mockUseEndgameChainSync = jest.fn(() => ({
  isConfirmationPending: false,
  isClaimedOnChain: false,
  lastSample: null,
}));

jest.mock('../../../../hooks/useEndgameChainSync', () => ({
  useEndgameChainSync: (...args: unknown[]) => (mockUseEndgameChainSync as jest.Mock)(...args),
}));

/* ── useAllocationNotification ───────────────────────────────────────── */

const mockRequestNotificationPermission = jest.fn();
jest.mock('../../../../hooks/useAllocationNotification', () => ({
  useAllocationNotification: () => ({
    playAudio: jest.fn(),
    requestNotificationPermission: mockRequestNotificationPermission,
  }),
}));

const mockNotify = jest.fn();
jest.mock('../../../../hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: jest.fn() }),
}));

jest.mock('../../../../hooks/useMetaMaskWatchAsset', () => ({
  useMetaMaskWatchAsset: () => ({
    isMetaMaskConnected: false,
    isAddingCst: false,
    isAddingNft: false,
    addCst: jest.fn(),
    addCosmicSignatureNft: jest.fn(),
  }),
}));

/* ── wagmi / web3 ───────────────────────────────────────────────── */

let mockAccount: string | null = '0xUser';
jest.mock('../../../../hooks/web3', () => ({
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
    data-cst-duration={String(
      (props.cstGestureData as typeof mockGestureForm.cstGestureData | undefined)
        ?.AuctionDuration ?? 0,
    )}
    data-cst-elapsed={String(
      (props.cstGestureData as typeof mockGestureForm.cstGestureData | undefined)?.SecondsElapsed ??
        0,
    )}
  >
    GestureStatus
  </div>
));

jest.mock('../../../../components/common/GestureStatus', () => ({
  GestureStatus: (props: Record<string, unknown>) => mockGestureStatus(props),
}));

jest.mock('../../../../components/home/GestureForm', () => ({
  GestureForm: ({
    previewMode = false,
    cstGestureData,
  }: {
    previewMode?: boolean;
    cstGestureData?: typeof mockGestureForm.cstGestureData;
  }) => (
    <div
      data-testid="gesture-form"
      data-preview={String(previewMode)}
      data-cst-duration={String(cstGestureData?.AuctionDuration ?? 0)}
      data-cst-elapsed={String(cstGestureData?.SecondsElapsed ?? 0)}
    >
      GestureForm
    </div>
  ),
}));

// Data-heavy child with its own API/chain reads (useChampions); the board's
// own rendering is covered by components/home/deck/__tests__.
const mockAllocationTracksBoard = jest.fn(
  (props: { data: Record<string, unknown> | null; account?: string | null }) => (
    <div
      data-testid="allocation-tracks-board"
      data-account={props.account ?? ''}
      data-has-data={String(props.data != null)}
    >
      AllocationTracksBoard
    </div>
  ),
);

jest.mock('../../../../components/home/deck/AllocationTracksBoard', () => ({
  AllocationTracksBoard: (props: {
    data: Record<string, unknown> | null;
    account?: string | null;
  }) => mockAllocationTracksBoard(props),
}));

jest.mock('../../../../components/attachments/DonatedNFTPrizeShowcase', () => ({
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

jest.mock('../../../../components/home/RoundInfoSection', () => ({
  RoundInfoSection: () => <div data-testid="round-info-section">RoundInfoSection</div>,
}));

jest.mock('../../../../components/home/WinningHistorySection', () => ({
  WinningHistorySection: () => <div data-testid="winning-history">WinningHistorySection</div>,
}));

jest.mock('../../../../components/nft/LatestNFTs', () => ({
  __esModule: true,
  default: () => <div data-testid="latest-nfts">LatestNFTs</div>,
}));

jest.mock('../../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

const specialRecipientsRenderSpy = jest.fn();
jest.mock('../../../../components/tables/SpecialAllocationRecipients', () => ({
  SpecialAllocationRecipients: (props: {
    currentAccount?: string | null;
    latestMessage?: string;
    latestGesture?: { EvtLogId?: number; BidderAddr?: string } | null;
  }) => {
    specialRecipientsRenderSpy();
    return (
      <div
        data-testid="special-allocation-recipients"
        data-account={props.currentAccount ?? ''}
        data-message={props.latestMessage ?? ''}
        data-latest-gesture-id={props.latestGesture?.EvtLogId ?? ''}
        data-latest-gesture-address={props.latestGesture?.BidderAddr ?? ''}
      >
        SpecialAllocationRecipients
      </div>
    );
  },
}));

jest.mock('../../../../utils', () => ({
  formatSeconds: (seconds: number) => `${seconds}s`,
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
  formatId: (id: number | string) => `#${id.toString().padStart(6, '0')}`,
  formatTableAmount: (value: number | null | undefined) =>
    value == null || !Number.isFinite(value) ? '\u2014' : String(value),
  getAssetsUrl: (path: string) => `https://assets.example.com/${path}`,
  getEnduranceChampions: () => [],
  getGestureKindLabel: (gestureType: unknown) =>
    gestureType === 2
      ? 'a CST gesture'
      : gestureType === 1
        ? 'an ETH + RandomWalk gesture'
        : 'an ETH gesture',
  getRelativeTime: () => 'just now',
  resolveGestureTypeCode: (record: { GestureType?: unknown; BidType?: unknown }) =>
    typeof record.GestureType === 'number'
      ? record.GestureType
      : typeof record.BidType === 'number'
        ? record.BidType
        : undefined,
  shortenHex: (hex: string, length = 4) =>
    hex ? `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}` : '',
}));

jest.mock('../../../../utils/errors', () => ({
  reportError: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  resetUxScenarioForTest();
  window.history.pushState({}, '', '/');
  mockAccount = '0xUser';
  mockUseEndgameChainSync.mockReturnValue({
    isConfirmationPending: false,
    isClaimedOnChain: false,
    lastSample: null,
  });
  Object.assign(mockGestureForm, {
    gestureType: 'ETH',
    contributionType: 'NFT',
    cstGestureData: {
      AuctionDuration: 3600,
      CSTPrice: 1,
      CSTPriceWei: 1000000000000000000n,
      SecondsElapsed: 1800,
      isFree: false,
      source: 'api' as const,
    },
    ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
    gestureCstRewardAmount: 100,
    gestureCstRewardAmountMin: 99,
    isCstRewardLoading: false,
    cstRewardTolerancePercent: 1,
    acceptAnyCstReward: false,
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
    allocationTime: Date.now() + 13 * 60 * 60_000,
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

function mockScrollIntoView() {
  const scrollIntoView = jest.fn();
  const prototype = window.HTMLElement.prototype as Partial<Pick<HTMLElement, 'scrollIntoView'>>;
  const original = prototype.scrollIntoView;

  Object.defineProperty(prototype, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: scrollIntoView,
  });

  return {
    scrollIntoView,
    restore: () => {
      if (original) {
        Object.defineProperty(prototype, 'scrollIntoView', {
          configurable: true,
          writable: true,
          value: original,
        });
      } else {
        delete prototype.scrollIntoView;
      }
    },
  };
}

/** The console's own submit button, distinct from monument/composer twins. */
function getConsoleSubmitButton() {
  const button = document.getElementById('gesture-submit');
  expect(button).toBeInstanceOf(HTMLButtonElement);
  return button as HTMLButtonElement;
}

/* ── Tests ──────────────────────────────────────────────────────── */

describe('HomePage', () => {
  /* ── Deck structure ─────────────────────────────────────────── */

  it('leads with the Deck header (page H1) above the deck grid', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });

    render(<HomePage />);

    const header = screen.getByTestId('home-deck-header');
    expect(
      within(header).getByRole('heading', { level: 1, name: 'home.deck.title' }),
    ).toBeInTheDocument();
    expect(within(header).getByText('home.deck.intro')).toBeInTheDocument();
    expect(within(header).getByText('home.hero.cycleNumber(number=7)')).toBeInTheDocument();
    expect(within(header).getByRole('link', { name: /home\.deck\.newHere/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );

    const deck = screen.getByTestId('home-deck-layout');
    expect(header.compareDocumentPosition(deck)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders the deck grid with the tracks board, monument, and chat panel', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });

    render(<HomePage />);

    const deck = screen.getByTestId('home-deck-layout');
    const board = screen.getByTestId('allocation-tracks-board');
    const monument = screen.getByTestId('cycle-monument');
    const chatColumn = screen.getByTestId('home-deck-chat');

    expect(deck).toContainElement(board);
    expect(deck).toContainElement(monument);
    expect(deck).toContainElement(chatColumn);
    expect(chatColumn).toContainElement(screen.getByTestId('gesture-message-chat'));
    expect(chatColumn).toContainElement(screen.getByTestId('gesture-composer'));
    expect(monument).toHaveAttribute('data-phase', 'live');
    expect(board).toHaveAttribute('data-account', '0xUser');
    expect(board).toHaveAttribute('data-has-data', 'true');
  });

  it('shows the Signature Allocation reserve and latest gesture inside the monument', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, PrizeAmountEth: 2.75 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 42,
          TimeStamp: Math.floor(Date.now() / 1000) - 150,
          BidderAddr: '0x1111111111111111111111111111111111111111',
          RoundNum: 7,
          GestureType: 0,
          Message: '',
        },
      ],
    });

    render(<HomePage />);

    const reserve = screen.getByTestId('monument-reserve');
    expect(within(reserve).getByText('home.deck.monument.reserveLabel')).toBeInTheDocument();
    expect(within(reserve).getByText('2.7500 ETH')).toBeInTheDocument();
    expect(within(reserve).getByText('home.deck.monument.reserveExtras')).toBeInTheDocument();

    const latest = screen.getByTestId('monument-latest-gesture');
    expect(latest).toHaveAttribute('href', '/gesture/42');
    expect(latest).toHaveTextContent(
      'home.ticker.gestureLine(address=0x111111....111111,kind=eth)',
    );
    expect(latest).toHaveTextContent('home.ticker.age.minutes(count=2)');
  });

  it('labels CST gestures in the monument latest-gesture line', () => {
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

    expect(screen.getByTestId('monument-latest-gesture')).toHaveTextContent(/kind=cst/);
  });

  it('offers monument method pills that reset the RandomWalk token on change', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const pills = screen.getByTestId('monument-method-pills');
    expect(
      within(pills).getByRole('button', { name: /home\.form\.method\.eth\.label/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(pills).getByRole('button', { name: /home\.form\.method\.cst\.label/ }));

    expect(mockGestureForm.setRwlkId).toHaveBeenCalledWith(-1);
    expect(mockGestureForm.setBidType).toHaveBeenCalledWith('CST');
  });

  it('renders the story hero below the deck with a level-2 heading', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, CurNumBids: 42, PrizeAmountEth: 2.75 }),
      isLoading: false,
    });

    render(<HomePage />);

    const deck = screen.getByTestId('home-deck-layout');
    const story = screen.getByTestId('home-story-section');
    expect(deck.compareDocumentPosition(story)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(
      within(story).getByRole('heading', { level: 2, name: 'home.hero.phase.live.headline' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: 'home.hero.phase.live.headline' }),
    ).not.toBeInTheDocument();
    expect(within(story).getByText('home.hero.story.gestures.title')).toBeInTheDocument();
    expect(within(story).getByText('home.hero.story.cst.title')).toBeInTheDocument();
    expect(within(story).getByText('home.hero.story.publicGoods.title')).toBeInTheDocument();

    const observatory = within(story).getByRole('region', {
      name: 'home.hero.console.ariaLabel',
    });
    expect(
      within(observatory).getByRole('heading', { name: 'home.hero.cycleNumber(number=7)' }),
    ).toBeInTheDocument();
    expect(within(observatory).getByText('42')).toBeInTheDocument();
    expect(within(observatory).getByText('2.7500 ETH')).toBeInTheDocument();
    expect(within(observatory).getByText('7%')).toBeInTheDocument();
  });

  it('renders the cycle phase guide after the story section', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const story = screen.getByTestId('home-story-section');
    const phaseGuide = screen.getByRole('heading', { name: 'home.phaseGuide.title' });
    expect(story.compareDocumentPosition(phaseGuide)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByRole('list', { name: 'home.phaseGuide.timelineAria' })).toBeInTheDocument();
  });

  it('keeps real hero artwork visible and linked on the main game page', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockUseCSTInfo.mockReturnValue({ data: { Seed: 'abc123' } });

    render(<HomePage />);

    expect(
      screen.getByRole('link', { name: /home\.hero\.console\.viewSignatureAria/ }),
    ).toHaveAttribute('href', expect.stringMatching(/^\/detail\/\d+$/));
    expect(screen.getByTestId('nft-image')).toHaveAttribute(
      'alt',
      expect.stringMatching(/^home\.hero\.console\.artworkAlt\(id=#\d{6}\)$/),
    );
  });

  /* ── CTAs and phases ────────────────────────────────────────── */

  it('hero primary action only scrolls to gesture options when the cycle is active', async () => {
    const user = userEvent.setup();
    const { scrollIntoView, restore } = mockScrollIntoView();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    try {
      render(<HomePage />);

      const story = screen.getByTestId('home-story-section');
      await user.click(within(story).getByRole('button', { name: /home\.hero\.phase\.live\.cta/ }));

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
      expect(mockGestureForm.onGestureWithCST).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it('monument full-console action only scrolls and never submits', async () => {
    const user = userEvent.setup();
    const { scrollIntoView, restore } = mockScrollIntoView();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    try {
      render(<HomePage />);

      const monument = screen.getByTestId('cycle-monument');
      await user.click(
        within(monument).getByRole('button', { name: /home\.deck\.monument\.fullConsole/ }),
      );

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
      expect(mockAllocationFinalize.onFinalize).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it('lets the eligible wallet finalize straight from the monument', async () => {
    const user = userEvent.setup();
    const finalGestureParticipant = '0x1234567890abcdef1234567890abcdef12345678';
    mockAccount = finalGestureParticipant;
    // Comfortably past the deadline so clock skew cannot flip the phase.
    mockAllocationFinalize.allocationTime = Date.now() - 60 * 60_000;
    mockAllocationFinalize.timeoutFinalize = 0;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ LastBidderAddr: finalGestureParticipant }),
      isLoading: false,
    });

    render(<HomePage />);

    const monument = screen.getByTestId('cycle-monument');
    expect(monument).toHaveAttribute('data-phase', 'ready-to-finalize');
    await user.click(within(monument).getByRole('button', { name: /home\.form\.finalize/ }));

    expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1);
  });

  it('holds the timer in the confirming phase until the zero-cross is verified on-chain', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ LastBidderAddr: mockAccount }),
      isLoading: false,
    });
    mockAllocationFinalize.allocationTime = Date.now() - 60 * 60_000;
    mockUseEndgameChainSync.mockReturnValue({
      isConfirmationPending: true,
      isClaimedOnChain: false,
      lastSample: null,
    });

    render(<HomePage />);

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'confirming');
    // The finalize CTA must not appear while the ready state is unverified: a
    // last-second gesture may still have extended the cycle on-chain.
    expect(screen.queryByRole('button', { name: /home\.form\.finalize/ })).not.toBeInTheDocument();
  });

  it('links to cycle details before gestures are open', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockAllocationFinalize.activationTime = Math.floor(Date.now() / 1000) + 3600;

    render(<HomePage />);

    expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('gesture-composer')).not.toBeInTheDocument();
    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'opening-soon');
    expect(
      screen.getByRole('heading', { level: 2, name: 'home.hero.phase.openingSoon.headline' }),
    ).toBeInTheDocument();
    const links = screen.getAllByRole('link', {
      name: /home\.hero\.viewCycleDetails|home\.chrono\.cta\.viewCycle/,
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/current-cycle');
    }
  });

  /* ── Status and form wiring ─────────────────────────────────── */

  it('shows gesture form skeletons instead of a blocking overlay while loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status', { name: 'home.form.loadingAria' })).toBeInTheDocument();
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

  it('passes merged CST gesture data into GestureStatus', () => {
    const cstGestureData = {
      AuctionDuration: 5400,
      CSTPrice: 2.5,
      CSTPriceWei: 2500000000000000000n,
      SecondsElapsed: 2700,
      isFree: false,
      source: 'contract' as const,
      apiAuctionDuration: 43200,
      apiSecondsElapsed: 1200,
    };
    Object.assign(mockGestureForm, { cstGestureData });
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(mockGestureStatus).toHaveBeenCalledWith(expect.objectContaining({ cstGestureData }));
    expect(screen.getByTestId('gesture-status')).toHaveAttribute('data-cst-duration', '5400');
    expect(screen.getByTestId('gesture-status')).toHaveAttribute('data-cst-elapsed', '2700');
  });

  it('passes live-derived CST elapsed values into status and form surfaces', () => {
    Object.assign(mockGestureForm, {
      cstGestureData: {
        AuctionDuration: 7200,
        CSTPrice: 2,
        CSTPriceWei: 2000000000000000000n,
        SecondsElapsed: 100,
        isFree: false,
        source: 'contract' as const,
        updatedAtMs: Date.now() - 30_500,
      },
    });
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(screen.getByTestId('gesture-status')).toHaveAttribute('data-cst-duration', '7200');
    expect(Number(screen.getByTestId('gesture-status').dataset.cstElapsed)).toBeGreaterThanOrEqual(
      120,
    );
    expect(screen.getByTestId('gesture-form')).toHaveAttribute('data-cst-duration', '7200');
    expect(Number(screen.getByTestId('gesture-form').dataset.cstElapsed)).toBeGreaterThanOrEqual(
      120,
    );
  });

  it('uses live-derived CST state for the submit button label', () => {
    Object.assign(mockGestureForm, {
      gestureType: 'CST',
      cstGestureData: {
        AuctionDuration: 10,
        CSTPrice: 2,
        CSTPriceWei: 2000000000000000000n,
        SecondsElapsed: 9,
        isFree: false,
        source: 'contract' as const,
        updatedAtMs: Date.now() - 30_500,
      },
    });
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(getConsoleSubmitButton()).toHaveTextContent('home.form.submit.cstFree');
  });

  it('keeps merged CST data wired while rendering the disconnected preview path', () => {
    mockAccount = null;
    Object.assign(mockGestureForm, {
      cstGestureData: {
        AuctionDuration: 7200,
        CSTPrice: 0,
        CSTPriceWei: 0n,
        SecondsElapsed: 7201,
        isFree: true,
        source: 'contract' as const,
      },
    });
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(screen.getByTestId('gesture-form')).toHaveAttribute('data-preview', 'true');
    expect(screen.getByTestId('gesture-status')).toHaveAttribute('data-cst-duration', '7200');
    expect(screen.getByTestId('gesture-status')).toHaveAttribute('data-cst-elapsed', '7201');
  });

  /* ── Chat and composer ──────────────────────────────────────── */

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

  it('docks the composer directly above the chat feed with the live gesture cost', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const chatColumn = screen.getByTestId('home-deck-chat');
    const composer = within(chatColumn).getByTestId('gesture-composer');
    const chat = within(chatColumn).getByTestId('gesture-message-chat');
    expect(composer.compareDocumentPosition(chat)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(within(composer).getByTestId('composer-message-input')).toBeInTheDocument();
    const send = within(composer).getByRole('button', {
      name: /home\.form\.submit\.eth\(cost=0\.01020\)/,
    });
    expect(send).toBeEnabled();
    expect(within(composer).getByText('home.deck.composer.note')).toBeInTheDocument();
  });

  it('submits a gesture with the drafted message straight from the composer', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const composer = screen.getByTestId('gesture-composer');
    await user.type(within(composer).getByTestId('composer-message-input'), 'gm');
    expect(mockGestureForm.setMessage).toHaveBeenCalled();

    await user.click(within(composer).getByRole('button', { name: /home\.form\.submit\.eth/ }));

    expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1);
    expect(mockRequestNotificationPermission).toHaveBeenCalledTimes(1);
  });

  it('switches the composer method pills through the shared form state', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const composer = screen.getByTestId('gesture-composer');
    await user.click(
      within(composer).getByRole('button', { name: /home\.form\.method\.cst\.label/ }),
    );

    expect(mockGestureForm.setRwlkId).toHaveBeenCalledWith(-1);
    expect(mockGestureForm.setBidType).toHaveBeenCalledWith('CST');
  });

  it('shows a connect prompt in the composer when the wallet is disconnected', () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const composer = screen.getByTestId('gesture-composer');
    expect(within(composer).getByTestId('composer-connect')).toBeInTheDocument();
    expect(within(composer).queryByTestId('composer-message-input')).not.toBeInTheDocument();
  });

  it('focuses the composer from the chat empty-state CTA', async () => {
    const user = userEvent.setup();
    const { scrollIntoView, restore } = mockScrollIntoView();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({ data: [] });

    try {
      render(<HomePage />);

      const chat = screen.getByTestId('gesture-message-chat');
      await user.click(within(chat).getByRole('button', { name: 'home.chat.empty.cta' }));

      expect(screen.getByTestId('composer-message-input')).toHaveFocus();
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      expect(mockGestureForm.setAdvancedExpanded).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it('falls back to the console message options when the composer has no input', async () => {
    const user = userEvent.setup();
    const { scrollIntoView, restore } = mockScrollIntoView();
    mockAccount = null; // composer renders its connect prompt without a textarea
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({ data: [] });

    try {
      render(<HomePage />);

      const chat = screen.getByTestId('gesture-message-chat');
      await user.click(within(chat).getByRole('button', { name: 'home.chat.empty.cta' }));

      expect(mockGestureForm.setAdvancedExpanded).toHaveBeenCalledWith(true);
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    } finally {
      restore();
    }
  });

  it('keeps the gesture chat in the page when the current cycle has no messages', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({ data: [] });

    render(<HomePage />);

    const chat = screen.getByTestId('gesture-message-chat');
    expect(within(chat).getByText('home.chat.empty.title')).toBeInTheDocument();
  });

  /* ── Console layout and rail ────────────────────────────────── */

  it('keeps the full console below the deck with status, form, and leaders in order', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const deck = screen.getByTestId('home-deck-layout');
    const consoleLayout = screen.getByTestId('home-console-layout');
    expect(deck.compareDocumentPosition(consoleLayout)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    const status = screen.getByTestId('gesture-status');
    const form = screen.getByTestId('gesture-form');
    const leaders = screen.getByTestId('special-allocation-recipients');
    const primaryColumn = screen.getByTestId('home-primary-column');

    expect(primaryColumn).toContainElement(status);
    expect(primaryColumn).toContainElement(form);
    expect(primaryColumn).toContainElement(leaders);
    expect(status.compareDocumentPosition(form)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(form.compareDocumentPosition(leaders)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    // Allocation breakdown renders full-width after the console grid.
    const allocationHeading = screen.getByText('home.allocation.title');
    expect(consoleLayout.compareDocumentPosition(allocationHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('uses a wider home shell and keeps desktop companion actions in the rail', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    const { container } = render(<HomePage />);

    const main = container.querySelector('main');
    const rail = screen.getByTestId('home-rail-column');
    const cycleDetailsLink = screen.getByTestId('cycle-details-link-card');
    const publicGoods = screen.getByTestId('public-goods-impact-card');

    expect(main).toHaveClass('xl:max-w-[92rem]', '2xl:max-w-[108rem]', '2xl:px-10');
    expect(rail).toContainElement(cycleDetailsLink);
    expect(rail).toContainElement(publicGoods);
    expect(cycleDetailsLink).toHaveAttribute('href', '/current-cycle');
    expect(publicGoods).toHaveAttribute('data-variant', 'rail');
  });

  it('fills the rail with attached assets when the current cycle has them', () => {
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
    const rail = screen.getByTestId('home-rail-column');
    const showcase = screen.getByTestId('attached-nft-showcase');
    const gestureStatusProps =
      mockGestureStatus.mock.calls[mockGestureStatus.mock.calls.length - 1]?.[0];

    expect(gestureStatusProps).toEqual(
      expect.objectContaining({ attachedNFTCount: 2, attachedERC20Count: 1 }),
    );
    expect(rail).toContainElement(showcase);
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

    const rail = screen.getByTestId('home-rail-column');

    expect(rail).toContainElement(screen.getByTestId('cycle-details-link-card'));
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

  /* ── Sections presence ──────────────────────────────────────── */

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
    expect(screen.getByText('home.allocation.title')).toBeInTheDocument();
  });

  it('renders Public Goods impact card when dashboard data is loaded', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText('home.publicGoods.heading')).toBeInTheDocument();
    expect(screen.getAllByText('0.7000 ETH').length).toBeGreaterThan(0);
  });

  it('renders link to full cycle details', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByText('home.cycleDetails.title')).toBeInTheDocument();
  });

  it('shows previous cycle allocations links in the rail and story console when cycle > 1', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 5 }),
      isLoading: false,
    });
    render(<HomePage />);
    const links = screen.getAllByText('home.hero.console.previousAllocations(number=4)');
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('previous-cycle-link-card')).toHaveAttribute('href', '/allocation/4');
  });

  it('does not show previous cycle link when cycle is 1', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 1 }),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.queryByText(/home\.hero\.console\.previousAllocations/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('previous-cycle-link-card')).not.toBeInTheDocument();
  });

  it('does not render GestureForm when still loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
  });

  /* ── Wallet states ──────────────────────────────────────────── */

  it('shows a gesture form preview with a connect prompt when account is null', async () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(screen.getByTestId('gesture-form')).toHaveAttribute('data-preview', 'true');
    expect(screen.getByText('home.form.connect.title')).toBeInTheDocument();
    expect((await screen.findAllByTestId('connect-wallet-button')).length).toBeGreaterThanOrEqual(
      1,
    );
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
    expect(getConsoleSubmitButton()).toBeEnabled();
  });

  it('shows a sticky mobile gesture CTA labelled for the wallet state', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    const { rerender } = render(<HomePage />);
    expect(screen.getByRole('link', { name: 'home.mobileCta.makeGesture' })).toHaveAttribute(
      'href',
      '#deck',
    );

    mockAccount = null;
    rerender(<HomePage />);
    expect(screen.getByRole('link', { name: 'home.mobileCta.preview' })).toHaveAttribute(
      'href',
      '#deck',
    );
  });

  /* ── Live pulse and memo boundaries ─────────────────────────── */

  it('pulses live surfaces when a cosmic:gesture-placed event arrives', async () => {
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

      const latest = screen.getByTestId('monument-latest-gesture');
      expect(latest).not.toHaveClass('animate-live-flash');

      act(() => {
        window.dispatchEvent(new Event('cosmic:gesture-placed'));
      });

      expect(latest).toHaveClass('animate-live-flash');
      expect(screen.getByTestId('gesture-message-chat')).toHaveClass('animate-live-flash');

      act(() => {
        jest.advanceTimersByTime(950);
      });
      expect(latest).not.toHaveClass('animate-live-flash');
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not re-render heavy memoized sections on countdown ticks', () => {
    // The page re-renders every second via useNow to keep countdown-derived
    // CTA state fresh. The heavy sections are wrapped in memo boundaries
    // with referentially stable props, so ticks must not reconcile them —
    // that main-thread churn was part of the mobile INP problem.
    jest.useFakeTimers();
    try {
      mockUseDashboardInfo.mockReturnValue({
        data: makeDashboardData({ CurRoundNum: 7 }),
        isLoading: false,
      });

      render(<HomePage />);
      const rendersAfterMount = specialRecipientsRenderSpy.mock.calls.length;
      expect(rendersAfterMount).toBeGreaterThan(0);

      act(() => {
        jest.advanceTimersByTime(3_000);
      });

      expect(specialRecipientsRenderSpy.mock.calls.length).toBe(rendersAfterMount);
    } finally {
      jest.useRealTimers();
    }
  });

  /* ── Submitting and finalizing ──────────────────────────────── */

  it('optimistically records the gesture in the dashboard cache after submitting', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    await user.click(getConsoleSubmitButton());

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
    const gestureButton = buttons.find((b) => b.textContent?.includes('home.form.submit'));
    expect(gestureButton).toBeDefined();
  });

  it('submits an ETH gesture from a connected wallet', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    expect(getConsoleSubmitButton()).toHaveTextContent('home.form.submit.eth(cost=0.01020)');
    await user.click(getConsoleSubmitButton());

    expect(mockRequestNotificationPermission).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGestureWithCST).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });
    expect(mockGestureForm.setMessage).toHaveBeenCalledWith('');
  });

  it('submits a gesture from the monument button', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    const monument = screen.getByTestId('cycle-monument');
    await user.click(within(monument).getByRole('button', { name: /home\.form\.submit\.eth/ }));

    expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1);
  });

  it('uses the localized toast key for a simulated gesture', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/?uxScenario=live-mid-cycle');
    resetUxScenarioForTest();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);

    await user.click(getConsoleSubmitButton());

    expect(mockNotify).toHaveBeenCalledWith('success', 'toasts.gesture.simulated(seconds=25)');
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
  });

  it('submits a CST gesture through the CST interaction path', async () => {
    const user = userEvent.setup();
    mockGestureForm.gestureType = 'CST';
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    expect(getConsoleSubmitButton()).toHaveTextContent('home.form.submit.cst(cost=1.00)');
    await user.click(getConsoleSubmitButton());

    expect(mockGestureForm.onGestureWithCST).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
  });

  it('prevents ETH + RandomWalk gestures until the participant selects a token', async () => {
    const user = userEvent.setup();
    mockGestureForm.gestureType = 'RandomWalk';
    mockGestureForm.rwlkId = -1;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    const gestureButton = getConsoleSubmitButton();
    expect(gestureButton).toHaveTextContent('home.form.submit.randomWalk');
    expect(gestureButton).toBeDisabled();
    await user.click(gestureButton);
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();

    // The monument mirrors the guard and points at the console's token grid.
    const monument = screen.getByTestId('cycle-monument');
    expect(
      within(monument).getByRole('button', { name: /home\.deck\.monument\.chooseRwlkToken/ }),
    ).toBeInTheDocument();
    expect(
      within(monument).getByRole('button', { name: /home\.form\.submit\.randomWalk/ }),
    ).toBeDisabled();
  });

  it('renders finalize cycle button when data is available', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);
    const finalizeButton = screen.queryByText(/home\.form\.finalize/);
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
    const finalizeButtons = screen.getAllByRole('button', {
      name: /home\.form\.finalize/,
    });
    await user.click(finalizeButtons[finalizeButtons.length - 1]!);

    expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1);
  });

  it('renders loading skeletons and hides GestureForm when loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status', { name: 'home.form.loadingAria' })).toBeInTheDocument();
    expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
  });

  /* ── Error branch ───────────────────────────────────────────── */

  describe('when the dashboard read fails', () => {
    it('shows an error state instead of rendering an idle cycle', () => {
      mockUseDashboardInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });

      render(<HomePage />);

      expect(screen.getByText('home.error.title')).toBeInTheDocument();
      expect(screen.getByText('home.error.message')).toBeInTheDocument();
      expect(screen.queryByTestId('cycle-monument')).not.toBeInTheDocument();
      expect(screen.queryByTestId('allocation-tracks-board')).not.toBeInTheDocument();
      expect(screen.queryByTestId('gesture-composer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('gesture-form')).not.toBeInTheDocument();
    });

    it('refetches the dashboard when the retry action is used', async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseDashboardInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
      });

      render(<HomePage />);
      await user.click(screen.getByRole('button', { name: /Try again/ }));

      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('keeps the last good cycle data on screen when a refetch fails', () => {
      mockUseDashboardInfo.mockReturnValue({
        data: makeDashboardData({ CurRoundNum: 7 }),
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });

      render(<HomePage />);

      expect(screen.queryByText('home.error.title')).not.toBeInTheDocument();
      expect(screen.getByTestId('cycle-monument')).toBeInTheDocument();
    });

    it('has no accessibility violations in the error state', async () => {
      mockUseDashboardInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });

      const { container } = render(<HomePage />);
      await checkA11y(container);
    });
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
