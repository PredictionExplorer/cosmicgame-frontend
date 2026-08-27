import userEvent from '@testing-library/user-event';

import { resetUxScenarioForTest } from '@/lib/uxCycleScenarios';

import { render, screen, within, act, checkA11y } from '@/test-utils';

import HomePage from '../HomePage';

jest.mock('@rainbow-me/rainbowkit');

/* ── useApiQuery hooks ──────────────────────────────────────────── */

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseGestureListByCycle = jest.fn().mockReturnValue({ data: undefined });
const mockUseDonationsNFTByRound = jest.fn().mockReturnValue({ data: undefined });
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
  rwlknftIds: [] as number[],
  onGesture: jest.fn().mockResolvedValue(true),
  onGestureWithCST: jest.fn().mockResolvedValue(true),
};

jest.mock('../../../../hooks/useGestureForm', () => ({
  useGestureForm: () => mockGestureForm,
}));

/* ── useChampions ─────────────────────────────────────────────────── */

const mockChampions = {
  isLoading: false,
  hasData: true,
  endurance: {
    address: '0xEndurance',
    duration: 3600,
    lockedDuration: 3600,
    isLive: false,
  },
  chrono: {
    address: '0xChrono',
    duration: 1800,
    lockedDuration: 1800,
    isLive: false,
    statusText: 'Record standing',
    sourceText: 'API confirmed',
    hasLiveDetails: false,
  },
  chronoChallenge: {
    address: '0xEndurance',
    duration: 1200,
    recordToBeat: 1800,
    isLive: false,
    isRecordHolder: false,
    hasDetails: true,
    startsGrowingIn: 601,
  },
  lastCst: { address: '0xLastCst' },
  latestGesture: {
    address: '0xBidder',
    holdDuration: 600,
    latestGestureTime: 1_700_000_000,
    isCurrentEnduranceChampion: false,
    isExtendingEnduranceRecord: false,
    durationToBeat: 3601,
    secondsUntilEnduranceChampion: 3001,
    progressToEnduranceChampion: 16.7,
  },
  raw: null,
  source: 'api-v2' as const,
};

const mockUseChampions = jest.fn((_initialData?: unknown) => mockChampions);
jest.mock('../../../../hooks/useChampions', () => ({
  useChampions: (initialData?: unknown) => mockUseChampions(initialData),
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

/* ── notifications / prices ────────────────────────────────────── */

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

jest.mock('../../../../hooks/useTokenPrice', () => ({
  useTokenPrice: () => 2000,
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

/* ── child components with their own suites ─────────────────────── */

// Depends on ApiDataContext + champions reads; unit-tested in its own suite.
const mockDeckPersonalStrip = jest.fn((props: { account: string; gestures: unknown[] }) => (
  <div
    data-testid="deck-personal-strip"
    data-account={props.account}
    data-gesture-count={props.gestures.length}
  >
    DeckPersonalStrip
  </div>
));

jest.mock('../../../../components/home/deck/DeckPersonalStrip', () => ({
  DeckPersonalStrip: (props: { account: string; gestures: unknown[] }) =>
    mockDeckPersonalStrip(props),
}));

const attachedShowcaseRenderSpy = jest.fn();
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
  }) => {
    attachedShowcaseRenderSpy();
    return nfts.length > 0 || erc20Tokens.length > 0 ? (
      <section
        data-testid="attached-nft-showcase"
        data-count={nfts.length}
        data-erc20-count={erc20Tokens.length}
        data-cycle={cycleNumber}
        data-variant={variant}
      >
        Attached NFT Showcase
      </section>
    ) : null;
  },
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

// Image-grid heavy; the picker interaction is covered by the GesturePanel suite.
jest.mock('../../../../components/nft/PaginationRWLKGrid', () => ({
  __esModule: true,
  default: ({ selectedToken }: { selectedToken: number }) => (
    <div data-testid="rwlk-grid" data-selected={selectedToken}>
      RWLK grid
    </div>
  ),
}));

jest.mock('../../../../components/common/UniswapTradeButton', () => ({
  UniswapTradeButton: () => <a href="https://app.uniswap.org">Uniswap</a>,
}));

jest.mock('../../../../utils/errors', () => ({
  reportError: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  resetUxScenarioForTest();
  window.history.pushState({}, '', '/');
  // The story section marks returning visitors in localStorage; without a
  // reset, the first test in the file would leak "visited" into the rest.
  window.localStorage.clear();
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
  RaffleAmountEth: 0.4,
  StakingAmountEth: 0.6,
  CosmicGameBalanceEth: 10,
  PrizePercentage: 25,
  ChronoWarriorPercentage: 8,
  RafflePercentage: 4,
  StakingPercentage: 6,
  CharityPercentage: 7,
  CharityBalanceEth: '0.5',
  SumVoluntaryDonationsEth: '0.8',
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 10,
  NumRaffleNFTWinnersStakingRWalk: 10,
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

/** The in-page panel's submit button, distinct from the sheet twin. */
function getPanelSubmitButton() {
  const button = document.getElementById('gesture-submit');
  expect(button).toBeInstanceOf(HTMLButtonElement);
  return button as HTMLButtonElement;
}

/* ── Tests ──────────────────────────────────────────────────────── */

describe('HomePage', () => {
  /* ── First viewport structure ───────────────────────────────── */

  it('integrates the pulse bar (page H1, cycle, phase, activity) into the control desk', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, CurNumBids: 42 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 42,
          TimeStamp: Math.floor(Date.now() / 1000) - 12,
          BidderAddr: '0x1111111111111111111111111111111111111111',
          RoundNum: 7,
          GestureType: 0,
          Message: '',
        },
      ],
    });

    render(<HomePage />);

    const header = screen.getByTestId('home-deck-header');
    expect(
      within(header).getByRole('heading', { level: 1, name: 'home.deck.title' }),
    ).toBeInTheDocument();
    expect(within(header).getByText('home.deck.intro')).toBeInTheDocument();
    expect(within(header).getByText('home.hero.cycleNumber(number=7)')).toBeInTheDocument();
    expect(screen.getByTestId('pulse-phase-chip')).toHaveTextContent(
      'home.chrono.phase.live.label',
    );
    expect(screen.getByTestId('pulse-gesture-count')).toHaveTextContent(
      'home.observatory.pulse.gestureCount(count=42)',
    );
    expect(screen.getByTestId('pulse-last-gesture')).toHaveTextContent(
      /home\.ticker\.age\.seconds/,
    );
    expect(within(header).getByRole('link', { name: /home\.deck\.newHere/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );

    const desk = screen.getByTestId('control-desk');
    const grid = screen.getByTestId('control-desk-grid');
    expect(desk).toContainElement(header);
    expect(header.compareDocumentPosition(grid)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders the whole game state in one desk: clock, participant intel, panel, and ledger', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });

    render(<HomePage />);

    const desk = screen.getByTestId('control-desk');
    const clock = screen.getByTestId('cycle-clock');
    const latest = screen.getByTestId('latest-participant-intel');
    const chrono = screen.getByTestId('chrono-endurance-intel');
    const panel = screen.getByTestId('gesture-panel');
    const ledger = screen.getByTestId('allocation-ledger');

    expect(desk).toContainElement(clock);
    expect(desk).toContainElement(latest);
    expect(desk).toContainElement(chrono);
    expect(desk).toContainElement(panel);
    expect(desk).toContainElement(ledger);
    expect(clock).toHaveAttribute('data-phase', 'live');
    expect(screen.getByTestId('latest-participant-allocation-package')).toHaveTextContent(
      'home.allocation.amounts.eth(amount=1.5000)',
    );
    expect(screen.getByTestId('control-desk-chrono')).toHaveTextContent(
      'home.allocation.amounts.eth(amount=0.8000)',
    );
  });

  it('shows what is at stake on the clock: reserve ETH, USD, and extras', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, PrizeAmountEth: 2.75 }),
      isLoading: false,
    });

    render(<HomePage />);

    const reserve = screen.getByTestId('clock-reserve');
    expect(within(reserve).getByText('home.observatory.clock.reserveLabel')).toBeInTheDocument();
    expect(within(reserve).getByText('2.7500 ETH')).toBeInTheDocument();
    // 2.75 ETH × mocked 2,000 USD.
    expect(screen.getByTestId('clock-reserve-usd')).toHaveTextContent('amount=5,500');
    expect(within(reserve).getByText('home.observatory.clock.reserveExtras')).toBeInTheDocument();
  });

  it('keeps every allocation track visible in the integrated ledger with live amounts', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(
      within(screen.getByTestId('ledger-track-signature')).getByText(
        'home.allocation.amounts.eth(amount=1.5000)',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('ledger-track-public-goods')).getByText(
        'home.allocation.amounts.eth(amount=0.7000)',
      ),
    ).toBeInTheDocument();
    // The full percentage set is present, so the rollover chip appears too.
    expect(screen.getByTestId('ledger-track-next-cycle')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /home\.observatory\.ribbon\.fullBreakdown/ }),
    ).toHaveAttribute('href', '/current-cycle#allocation-breakdown');
  });

  it('shows live method prices inside the one gesture panel', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent('0.01000 ETH');
    expect(screen.getByTestId('panel-method-randomWalk-cost')).toHaveTextContent('0.00500 ETH');
    expect(screen.getByTestId('panel-method-cst-cost')).toHaveTextContent('1 CST');
  });

  it('restores complete latest-participant transaction and receipt intelligence', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 77,
          BidPosition: 7,
          TimeStamp: 1_700_000_000,
          BidderAddr: '0xBidder',
          RoundNum: 5,
          GestureType: 1,
          GestureCostEth: 0.05,
          ParticipationCST: 123.45,
          RWalkNFTId: 42,
          NFTDonationTokenAddr: '0xNFT',
          NFTDonationTokenId: 9,
          DonatedERC20TokenAddr: '0xToken',
          Message: 'The orbit holds.',
        },
      ],
    });
    mockUseDonationsNFTByRound.mockReturnValue({ data: [{ RecordId: 1 }] });
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: [{ EvtLogId: 1, TokenAddr: '0xToken' }],
    });

    render(<HomePage />);

    const intel = screen.getByTestId('latest-participant-intel');
    expect(within(intel).getByText('0xBidder')).toHaveAttribute('href', '/user/0xBidder');
    expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent('0.0500000 ETH');
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('123.45 CST');
    expect(screen.getByTestId('latest-participant-random-walk')).toHaveTextContent(
      'tables.specialAllocation.yesToken',
    );
    expect(screen.getByTestId('latest-participant-gesture-id')).toHaveTextContent('#7');
    expect(screen.getByTestId('latest-participant-attached-assets')).toHaveTextContent(
      'NFT + ERC20',
    );
    expect(screen.getByTestId('latest-participant-message')).toHaveTextContent('The orbit holds.');
    expect(
      screen.getByRole('progressbar', { name: 'tables.specialAllocation.progressAria' }),
    ).toHaveAttribute('aria-valuenow', '16');
    expect(screen.getByTestId('latest-participant-allocation-package')).toHaveTextContent(
      'home.observatory.intel.plusCycleAttachments',
    );
  });

  it('restores the active Endurance challenge and complete Chrono next-change state', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const challenge = screen.getByTestId('chrono-active-challenge');
    expect(challenge).toHaveTextContent('tables.specialAllocation.activeEnduranceChallenge');
    expect(challenge).toHaveTextContent('0xEndurance');
    expect(screen.getByTestId('chrono-challenge-segment')).toHaveTextContent('20m');
    expect(screen.getByTestId('chrono-challenge-record-to-beat')).toHaveTextContent('30m');
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent('10m 1s');
    expect(screen.getByTestId('chrono-role-summary')).toHaveTextContent(
      'home.allocation.amounts.eth(amount=0.8000)',
    );
  });

  it('keeps mobile prices in the desk while the inline console is desktop-only', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(screen.getByTestId('gesture-price-strip')).toBeInTheDocument();
    expect(screen.getByTestId('gesture-price-eth')).toHaveTextContent('0.01000 ETH');
    expect(screen.getByTestId('gesture-price-randomWalk')).toHaveTextContent('0.00500 ETH');
    expect(screen.getByTestId('gesture-price-cst')).toHaveTextContent('1 CST');
    expect(screen.getByTestId('control-desk-gesture')).toHaveClass('hidden', 'lg:block');
  });

  it('threads first-paint role and latest-gesture seeds into their live hooks', () => {
    const seededGesture = {
      EvtLogId: 88,
      TimeStamp: 1_700_000_100,
      BidderAddr: '0xSeeded',
      RoundNum: 5,
      GestureType: 0,
      GestureCostEth: 0.1,
      Message: '',
    } as never;
    const seededRecipients = {
      LastBidderAddress: '0xSeeded',
      LastBidderLastBidTime: 1_700_000_100,
    } as never;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(
      <HomePage initialLatestGesture={seededGesture} initialSpecialRecipients={seededRecipients} />,
    );

    expect(mockUseGestureListByCycle).toHaveBeenCalledWith(5, 'desc', [seededGesture]);
    expect(mockUseChampions).toHaveBeenCalledWith(seededRecipients);
  });

  /* ── Below the fold ─────────────────────────────────────────── */

  it('keeps personal state and allocations inside the desk before feed and education', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        { EvtLogId: 1, TimeStamp: 1700000000, BidderAddr: '0xUser', RoundNum: 5, Message: '' },
      ],
    });

    render(<HomePage />);

    const desk = screen.getByTestId('control-desk');
    const strip = screen.getByTestId('deck-personal-strip');
    const feed = screen.getByTestId('home-feed-layout');
    const ledger = screen.getByTestId('allocation-ledger');
    const story = screen.getByTestId('home-story-section');
    const phaseGuide = screen.getByRole('heading', { name: 'home.phaseGuide.title' });

    expect(desk).toContainElement(strip);
    expect(desk).toContainElement(ledger);
    expect(desk.compareDocumentPosition(feed)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(story.compareDocumentPosition(phaseGuide)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.queryByText('home.allocation.title')).not.toBeInTheDocument();
  });

  it('shows the personal strip for connected wallets only', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        { EvtLogId: 1, TimeStamp: 1700000000, BidderAddr: '0xUser', RoundNum: 5, Message: '' },
      ],
    });

    const { rerender } = render(<HomePage />);
    const strip = screen.getByTestId('deck-personal-strip');
    expect(strip).toHaveAttribute('data-account', '0xUser');
    expect(strip).toHaveAttribute('data-gesture-count', '1');

    mockAccount = null;
    rerender(<HomePage />);
    expect(screen.queryByTestId('deck-personal-strip')).not.toBeInTheDocument();
  });

  it('keeps artwork and attachments in the depth rail while consolidating cycle links above it', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7 }),
      isLoading: false,
    });
    mockUseCSTInfo.mockReturnValue({ data: { Seed: 'abc123' } });
    mockUseDonationsNFTByRound.mockReturnValue({ data: [{ RecordId: 1 }, { RecordId: 2 }] });
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: [{ EvtLogId: 1, TokenAddr: '0xToken', AmountDonatedEth: 5 }],
    });

    render(<HomePage />);

    const rail = screen.getByTestId('home-depth-rail');
    const actions = screen.getByTestId('home-feed-actions');
    expect(rail).toContainElement(screen.getByTestId('deck-art-card'));
    expect(actions).toContainElement(screen.getByTestId('cycle-details-link-card'));
    expect(screen.getByTestId('cycle-details-link-card')).toHaveAttribute('href', '/current-cycle');
    expect(screen.getByTestId('previous-cycle-link-card')).toHaveAttribute('href', '/allocation/6');
    expect(screen.queryByTestId('public-goods-impact-card')).not.toBeInTheDocument();

    const showcase = screen.getByTestId('attached-nft-showcase');
    expect(rail).toContainElement(showcase);
    expect(showcase).toHaveAttribute('data-count', '2');
    expect(showcase).toHaveAttribute('data-erc20-count', '1');
    expect(showcase).toHaveAttribute('data-cycle', '7');
    expect(showcase).toHaveAttribute('data-variant', 'rail');

    // The rotating artwork links to its detail page.
    expect(screen.getByTestId('deck-art-link')).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/detail\/\d+$/),
    );
  });

  it('omits optional rail cards when the cycle has nothing to show', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 1, CharityPercentage: 0 }),
      isLoading: false,
    });

    render(<HomePage />);

    expect(screen.queryByTestId('previous-cycle-link-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('public-goods-impact-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('attached-nft-showcase')).not.toBeInTheDocument();
  });

  it('renders the story hero below the fold with a level-2 heading', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, CurNumBids: 42, PrizeAmountEth: 2.75 }),
      isLoading: false,
    });

    render(<HomePage />);

    const story = screen.getByTestId('home-story-section');
    expect(
      within(story).getByRole('heading', { level: 2, name: 'home.hero.phase.live.headline' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 1, name: 'home.hero.phase.live.headline' }),
    ).not.toBeInTheDocument();
  });

  it('collapses the story section for returning visitors and expands on demand', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    // First visit: full story, and the visit is recorded.
    const first = render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'home.hero.phase.live.headline' }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('cosmic-observatory-visited')).toBe('1');
    first.unmount();

    // Return visit: collapsed to the disclosure row until expanded.
    render(<HomePage />);
    expect(
      screen.queryByRole('heading', { level: 2, name: 'home.hero.phase.live.headline' }),
    ).not.toBeInTheDocument();
    const expand = screen.getByTestId('story-expand');
    expect(expand).toHaveTextContent('home.deck.story.collapsedTitle');

    await user.click(expand);
    expect(
      screen.getByRole('heading', { level: 2, name: 'home.hero.phase.live.headline' }),
    ).toBeInTheDocument();
  });

  it('renders LatestNFTs after the shell', () => {
    mockUseDashboardInfo.mockReturnValue({ data: makeDashboardData(), isLoading: false });
    render(<HomePage />);
    expect(screen.getByTestId('latest-nfts')).toBeInTheDocument();
  });

  /* ── Gesture flow (the one panel) ───────────────────────────── */

  it('switches methods through the shared state, resetting any picked RandomWalk token', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const tabs = screen.getByTestId('panel-method-tabs');
    expect(
      within(tabs).getByRole('button', { name: /home\.form\.method\.eth\.label/ }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(tabs).getByRole('button', { name: /home\.form\.method\.cst\.label/ }));

    expect(mockGestureForm.setRwlkId).toHaveBeenCalledWith(-1);
    expect(mockGestureForm.setBidType).toHaveBeenCalledWith('CST');
  });

  it('submits an ETH gesture and refreshes live data optimistically', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    expect(getPanelSubmitButton()).toHaveTextContent('home.form.submit.eth(cost=0.01020)');
    await user.click(getPanelSubmitButton());

    expect(mockRequestNotificationPermission).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGestureWithCST).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });
    expect(mockGestureForm.setMessage).toHaveBeenCalledWith('');

    // Optimistic dashboard cache bump: gesture count and last participant.
    expect(mockSetQueryData).toHaveBeenCalledWith(['dashboardInfo'], expect.any(Function));
    const updater = mockSetQueryData.mock.calls[0]![1] as (
      current: Record<string, unknown> | null,
    ) => Record<string, unknown> | null;
    expect(updater(null)).toBeNull();
    expect(updater({ CurNumBids: 10, LastBidderAddr: '0xBidder' })).toEqual(
      expect.objectContaining({ CurNumBids: 11, LastBidderAddr: '0xUser' }),
    );
  });

  it('submits a CST gesture through the CST interaction path', async () => {
    const user = userEvent.setup();
    mockGestureForm.gestureType = 'CST';
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    expect(getPanelSubmitButton()).toHaveTextContent('home.form.submit.cst(cost=1.00)');
    await user.click(getPanelSubmitButton());

    expect(mockGestureForm.onGestureWithCST).toHaveBeenCalledTimes(1);
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
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

    // 9s elapsed + 30s since the sample crossed the 10s window: free now.
    expect(getPanelSubmitButton()).toHaveTextContent('home.form.submit.cstFree');
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

    // The token picker lives inline in the panel — no detour to a console.
    expect(screen.getByTestId('panel-rwlk-picker')).toBeInTheDocument();
    const gestureButton = getPanelSubmitButton();
    expect(gestureButton).toHaveTextContent('home.form.submit.randomWalk');
    expect(gestureButton).toBeDisabled();
    await user.click(gestureButton);
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
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

    await user.click(getPanelSubmitButton());

    expect(mockNotify).toHaveBeenCalledWith('success', 'toasts.gesture.simulated(seconds=25)');
    expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
  });

  it('applies RandomWalk deep links from the collection page', () => {
    window.history.pushState({}, '', '/?randomwalk=1&tokenId=77');
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(mockGestureForm.setRwlkId).toHaveBeenCalledWith(77);
    expect(mockGestureForm.setBidType).toHaveBeenCalledWith('RandomWalk');
  });

  /* ── Finalize (the clock's action) ──────────────────────────── */

  it('lets the eligible wallet finalize straight from the clock', async () => {
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

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'ready-to-finalize');
    await user.click(screen.getByTestId('clock-finalize'));

    expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1);
  });

  it('holds the clock in the confirming phase until the zero-cross is verified on-chain', () => {
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

    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'confirming');
    // The finalize CTA must not appear while the ready state is unverified: a
    // last-second gesture may still have extended the cycle on-chain.
    expect(screen.queryByTestId('clock-finalize')).not.toBeInTheDocument();
  });

  /* ── Lifecycle phases ───────────────────────────────────────── */

  it('drops the panel and dock before gestures open, keeping cycle-details paths', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockAllocationFinalize.activationTime = Math.floor(Date.now() / 1000) + 3600;

    render(<HomePage />);

    expect(screen.queryByTestId('gesture-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('action-dock-mobile')).not.toBeInTheDocument();
    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'opening-soon');
    expect(screen.getByTestId('clock-calendar-link')).toBeInTheDocument();
    const links = screen.getAllByRole('link', {
      name: /home\.hero\.viewCycleDetails|home\.chrono\.cta\.viewCycle/,
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/current-cycle');
    }
  });

  it('shows the panel skeleton instead of a blocking overlay while loading', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<HomePage />);
    expect(screen.getByRole('status', { name: 'home.form.loadingAria' })).toBeInTheDocument();
    expect(screen.getByTestId('gesture-panel-skeleton')).toBeInTheDocument();
    expect(document.getElementById('gesture-submit')).not.toBeInTheDocument();
  });

  it('draws the final-window vignette only inside the last ten minutes', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockAllocationFinalize.allocationTime = Date.now() + 5 * 60_000; // final-ten

    const { rerender } = render(<HomePage />);
    expect(screen.getByTestId('cycle-clock')).toHaveAttribute('data-phase', 'final-ten');
    expect(screen.getByTestId('final-window-vignette')).toBeInTheDocument();

    mockAllocationFinalize.allocationTime = Date.now() + 13 * 60 * 60_000; // live
    rerender(<HomePage />);
    expect(screen.queryByTestId('final-window-vignette')).not.toBeInTheDocument();
  });

  it('passes the chosen notification threshold into the clock control', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    const control = screen.getByTestId('clock-notify-control');
    await user.click(
      within(control).getByRole('button', {
        name: 'home.observatory.clock.notifyMinutes(minutes=60)',
      }),
    );

    expect(window.localStorage.getItem('cosmic-notify-threshold-min')).toBe('60');
    expect(
      within(control).getByRole('button', {
        name: 'home.observatory.clock.notifyMinutes(minutes=60)',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  /* ── Wallet states ──────────────────────────────────────────── */

  it('previews the panel with a connect prompt when the wallet is disconnected', async () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    render(<HomePage />);

    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(screen.getByText('home.form.preview')).toBeInTheDocument();
    // Live prices stay visible for observers deciding whether to join.
    expect(screen.getByTestId('panel-method-eth-cost')).toHaveTextContent('0.01000 ETH');
    expect((await screen.findAllByTestId('connect-wallet-button')).length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it('switches from the preview to live controls after the wallet connects', () => {
    mockAccount = null;
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    const { rerender } = render(<HomePage />);
    expect(screen.getByTestId('connect-to-gesture')).toBeInTheDocument();
    expect(document.getElementById('gesture-submit')).not.toBeInTheDocument();

    mockAccount = '0xUser';
    rerender(<HomePage />);

    expect(screen.queryByTestId('connect-to-gesture')).not.toBeInTheDocument();
    expect(getPanelSubmitButton()).toBeEnabled();
  });

  /* ── Feed and chat ──────────────────────────────────────────── */

  it('renders current-cycle gesture messages in the feed', () => {
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
      ],
    });

    render(<HomePage />);

    expect(mockUseGestureListByCycle).toHaveBeenCalledWith(7, 'desc', undefined);
    const chat = screen.getByTestId('gesture-message-chat');
    expect(screen.getByTestId('home-feed-column')).toContainElement(chat);
    expect(within(chat).getByText('Newest current-cycle signal')).toBeInTheDocument();
    expect(within(chat).getByText('Older current-cycle signal')).toBeInTheDocument();
  });

  it('interleaves derived system events into the chat feed alongside messages', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData({ CurRoundNum: 7, TsRoundStart: 1_699_999_000 }),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 1,
          TimeStamp: 1_700_000_000,
          BidderAddr: '0x1111111111111111111111111111111111111111',
          RoundNum: 7,
          GestureType: 0,
          Message: 'first signal',
        },
        {
          // 600s stint by 0x1111 completes here: a record event lands at this ts.
          EvtLogId: 2,
          TimeStamp: 1_700_000_600,
          BidderAddr: '0x2222222222222222222222222222222222222222',
          RoundNum: 7,
          GestureType: 0,
          Message: 'second signal',
        },
      ],
    });

    render(<HomePage />);

    const chat = screen.getByTestId('gesture-message-chat');
    const events = within(chat).getAllByTestId('chat-system-event');
    expect(events.length).toBe(2);
    expect(events.some((event) => event.dataset.kind === 'cycleStart')).toBe(true);
    expect(events.some((event) => event.dataset.kind === 'enduranceRecord')).toBe(true);
  });

  it('routes the chat join CTA to the gesture panel and focuses the message field', async () => {
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

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(screen.getByTestId('gesture-message-input')).toHaveFocus();
      expect(mockGestureForm.onGesture).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it('shows an optimistic pending message until the indexer echoes it', async () => {
    const user = userEvent.setup();
    mockGestureForm.message = 'fresh signal';
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });
    mockUseGestureListByCycle.mockReturnValue({ data: [] });

    const { rerender } = render(<HomePage />);
    await user.click(getPanelSubmitButton());

    const pendingRow = screen.getByTestId('chat-pending-message');
    expect(pendingRow).toHaveTextContent('fresh signal');

    // The indexer echoes the gesture — the pending row clears.
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 9,
          TimeStamp: Math.floor(Date.now() / 1000),
          BidderAddr: '0xUser',
          RoundNum: 5,
          GestureType: 0,
          Message: 'fresh signal',
        },
      ],
    });
    rerender(<HomePage />);
    expect(screen.queryByTestId('chat-pending-message')).not.toBeInTheDocument();
  });

  it('hero primary action only scrolls to the gesture panel when the cycle is active', async () => {
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

  /* ── Action dock and mobile sheet ───────────────────────────── */

  it('keeps the action dock priced with the shared submit label', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);

    expect(
      within(screen.getByTestId('action-dock-mobile')).getByTestId('dock-open-sheet'),
    ).toHaveTextContent('home.form.submit.eth(cost=0.01020)');
    // jest.setup's IntersectionObserver mock always reports out-of-view, so
    // the page must have flipped the desktop dock through the observer path.
    expect(screen.getByTestId('action-dock-desktop')).toBeInTheDocument();
  });

  it('opens the bottom sheet hosting the same gesture panel from the dock', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    expect(screen.getAllByTestId('gesture-panel')).toHaveLength(1);

    await user.click(screen.getByTestId('dock-open-sheet'));

    const panels = screen.getAllByTestId('gesture-panel');
    expect(panels).toHaveLength(2);
    expect(panels[panels.length - 1]).toHaveAttribute('data-variant', 'sheet');
  });

  it('submits from the sheet panel and closes it', async () => {
    const user = userEvent.setup();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboardData(),
      isLoading: false,
    });

    render(<HomePage />);
    await user.click(screen.getByTestId('dock-open-sheet'));

    const sheetSubmit = document.getElementById('gesture-submit-sheet');
    expect(sheetSubmit).toBeInstanceOf(HTMLButtonElement);
    await user.click(sheetSubmit as HTMLButtonElement);

    expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId('gesture-panel')).toHaveLength(1);
  });

  /* ── Live pulse and memo boundaries ─────────────────────────── */

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
      mockUseDonationsNFTByRound.mockReturnValue({ data: [{ RecordId: 1 }] });

      render(<HomePage />);
      const rendersAfterMount = attachedShowcaseRenderSpy.mock.calls.length;
      expect(rendersAfterMount).toBeGreaterThan(0);

      act(() => {
        jest.advanceTimersByTime(3_000);
      });

      expect(attachedShowcaseRenderSpy.mock.calls.length).toBe(rendersAfterMount);
    } finally {
      jest.useRealTimers();
    }
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
      expect(screen.queryByTestId('cycle-clock')).not.toBeInTheDocument();
      expect(screen.queryByTestId('standings-board')).not.toBeInTheDocument();
      expect(screen.queryByTestId('gesture-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('tracks-ribbon')).not.toBeInTheDocument();
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
      expect(screen.getByTestId('cycle-clock')).toBeInTheDocument();
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
