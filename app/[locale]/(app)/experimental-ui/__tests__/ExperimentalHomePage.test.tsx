import userEvent from '@testing-library/user-event';
import { zeroAddress } from 'viem';

import { resetUxScenarioForTest } from '@/lib/uxCycleScenarios';
import type { ChampionsState, useChampions } from '@/hooks/useChampions';
import type { SpecialAllocationSnapshot } from '@/hooks/useSpecialAllocationSnapshot';
import type { TxStage } from '@/lib/txStage';
import type { CSTTokenInfo, GestureInfo } from '@/services/api';

import { render, screen, within, act, waitFor } from '@/test-utils';

import ExperimentalHomePage from '../ExperimentalHomePage';

jest.mock('@rainbow-me/rainbowkit');

/* ── Data hooks ─────────────────────────────────────────────────── */

const mockUseDashboardInfo = jest.fn();
const mockUseHomeGestureFeed = jest.fn();
const mockUseCSTInfo = jest.fn();
const mockUseDonationsNFTByRound = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCurrentTime: () => ({ data: Math.floor(Date.now() / 1000), dataUpdatedAt: Date.now() }),
  useCSTInfo: (...args: unknown[]) => mockUseCSTInfo(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  // The hidden-message list the standings' Last Gesture line is moderated by: nothing hidden.
  useBannedGestures: () => ({ data: [], isError: false, refetch: jest.fn() }),
}));

const mockEmptyGestures: unknown[] = [];
jest.mock('@/hooks/useHomeGestureFeed', () => ({
  useHomeGestureFeed: (...args: unknown[]) => {
    const result = mockUseHomeGestureFeed(...args) ?? {};
    const gestures = result.data ?? mockEmptyGestures;
    return {
      gestures,
      chatGestures: gestures,
      latestGesture: gestures[gestures.length - 1] ?? null,
      mode: 'mode' in result ? result.mode : 'legacy',
      isLoading: result.isLoading ?? false,
      error: result.error ?? null,
      hasMore: false,
      isLoadingOlder: false,
      olderError: null,
      loadOlder: jest.fn(),
      retry: jest.fn(),
      resetKey: String(args[0]),
    };
  },
}));

type ChampionsArgs = Parameters<typeof useChampions>;
const mockChampions = jest.fn<ChampionsState, ChampionsArgs>();
jest.mock('@/hooks/useChampions', () => ({
  ...jest.requireActual('@/hooks/useChampions'),
  useChampions: (...args: ChampionsArgs) => mockChampions(...args),
}));

// The chain read behind the own-Gesture overlay and the verified alert.
const mockFetchEndgameChainSample = jest.fn();
jest.mock('@/lib/rpcRace', () => ({
  ...jest.requireActual('@/lib/rpcRace'),
  fetchEndgameChainSample: (...args: unknown[]) => mockFetchEndgameChainSample(...args),
}));

const mockSpecialSnapshot = jest.fn<
  { snapshot: SpecialAllocationSnapshot | null; isLoading: boolean },
  []
>(() => ({ snapshot: null, isLoading: false }));
jest.mock('@/hooks/useSpecialAllocationSnapshot', () => ({
  useSpecialAllocationSnapshot: () => mockSpecialSnapshot(),
}));

// The shared ticker: `0` is what it reads during server rendering and hydration.
let mockTickingNow: number | null = null;
jest.mock('@/hooks/useNow', () => ({
  useNow: () => mockTickingNow ?? Date.now(),
}));

/* ── Gesture form and cycle hooks ───────────────────────────────── */

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
  gestureCstRewardAmountMinLimitWei: 0n,
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
  gestureCostPlus: 0,
  setBidPricePlus: jest.fn(),
  isGesturing: false,
  gestureTxStage: { status: 'idle' } as TxStage,
  advancedExpanded: false,
  setAdvancedExpanded: jest.fn(),
  rwlknftIds: [],
  onGesture: jest.fn().mockResolvedValue(true),
  onGestureWithCST: jest.fn().mockResolvedValue(true),
  getLastGestureHash: jest.fn(() => '0xtxhash'),
};

const mockUseGestureFormOptions = jest.fn();
jest.mock('@/hooks/useGestureForm', () => ({
  useGestureForm: (options: unknown) => {
    mockUseGestureFormOptions(options);
    return mockGestureForm;
  },
}));

const mockAllocationFinalize = {
  fetchActivationTime: jest.fn().mockResolvedValue(0),
  allocationTime: Date.now() + 13 * 3600_000,
  timeoutFinalize: 600,
  isClaiming: false,
  activationTime: 0,
  onFinalize: jest.fn().mockResolvedValue(true),
};

jest.mock('@/hooks/useAllocationFinalize', () => ({
  useAllocationFinalize: () => mockAllocationFinalize,
}));

jest.mock('@/hooks/useEndgameChainSync', () => ({
  useEndgameChainSync: () => ({ isConfirmationPending: false }),
}));

jest.mock('@/hooks/useAllocationNotification', () => ({
  useAllocationNotification: () => undefined,
}));

jest.mock('@/hooks/useGestureChime', () => ({
  useGestureChime: () => undefined,
}));

const mockNotify = jest.fn();
jest.mock('@/hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: jest.fn() }),
}));

let mockAccount: string | null = null;
jest.mock('@/hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

const mockMediaQuery = jest.fn<boolean, [string]>(() => false);
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => mockMediaQuery(query),
}));

const mockSetQueryData = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockCancelQueries = jest.fn();
// When the deadline was last read; the return resync compares it with now.
let mockDeadlineUpdatedAt = Date.now();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    cancelQueries: mockCancelQueries,
    refetchQueries: jest.fn(),
    setQueryData: mockSetQueryData,
    getQueryState: () => ({ dataUpdatedAt: mockDeadlineUpdatedAt }),
    getQueryCache: () => ({
      subscribe: () => () => undefined,
      findAll: () => [],
      getAll: () => [],
    }),
  }),
}));

let mockFreshness: { state: string; ageMs: number } = { state: 'live', ageMs: 0 };
jest.mock('@/hooks/useLiveFreshness', () => ({
  useLiveFreshness: () => mockFreshness,
}));

const mockTabTitleCountdown = jest.fn();
jest.mock('@/hooks/useTabTitleCountdown', () => ({
  useTabTitleCountdown: (options: unknown) => mockTabTitleCountdown(options),
}));

jest.mock('@/contexts/ApiDataContext', () => ({
  useApiData: () => ({ apiData: { ETHRaffleToClaim: 0 } }),
}));

jest.mock('@/utils/errors', () => ({ reportError: jest.fn() }));

/* ── Shared children with their own suites ──────────────────────── */

const mockChat = jest.fn((props: { onJoinCta?: () => void; pendingMessages?: unknown[] }) => (
  <aside data-testid="gesture-message-chat" aria-label="chat">
    <span data-testid="pending-count">{props.pendingMessages?.length ?? 0}</span>
    {props.onJoinCta ? (
      <button type="button" onClick={props.onJoinCta}>
        join chat
      </button>
    ) : null}
  </aside>
));
jest.mock('@/components/home/GestureMessageChat', () => ({
  GestureMessageChat: (props: { onJoinCta?: () => void; pendingMessages?: unknown[] }) =>
    mockChat(props),
}));

jest.mock('@/components/attachments/DonatedNFTPrizeShowcase', () => ({
  AttachedNFTAllocationShowcase: ({ nfts }: { nfts: unknown[] }) => (
    <section data-testid="attached-nft-showcase" data-count={nfts.length} />
  ),
}));

interface MockActionDockProps {
  stepAside: boolean;
  submit: { action: string; cost: string | null };
  canClaim: boolean;
  data: { CurNumBids?: number; LastBidderAddr?: string } | null;
  onFinalize: () => void;
  onOpenSheet: () => void;
}
const mockActionDock = jest.fn((props: MockActionDockProps) => (
  <div data-testid="action-dock" data-hidden={String(props.stepAside)}>
    <button type="button" data-testid="dock-open-sheet" onClick={props.onOpenSheet}>
      {props.submit.action} {props.submit.cost}
    </button>
    {props.canClaim && (
      <button type="button" data-testid="dock-finalize" onClick={props.onFinalize}>
        finalize
      </button>
    )}
  </div>
));
jest.mock('@/components/home/observatory/ActionDock', () => ({
  ActionDock: (props: MockActionDockProps) => mockActionDock(props),
}));

/* ── Fixtures ───────────────────────────────────────────────────── */

const LATEST = '0x1111111111111111111111111111111111111111';
const CHAMPION = '0x3333333333333333333333333333333333333333';

function makeDashboard(overrides: Record<string, unknown> = {}) {
  return {
    CurRoundNum: 5,
    CurNumBids: 10,
    LastBidderAddr: LATEST,
    PrizeAmountEth: 1.5,
    CosmicGameBalanceEth: 10,
    PrizePercentage: 25,
    ChronoWarriorPercentage: 8,
    RafflePercentage: 4,
    StakingPercentage: 6,
    CharityPercentage: 7,
    RaffleAmountEth: 0.4,
    NumRaffleEthWinnersBidding: 3,
    TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
    MainStats: { NumCSTokenMints: 40 },
    ...overrides,
  };
}

function makeChampions(overrides: Partial<ChampionsState> = {}): ChampionsState {
  return {
    isLoading: false,
    hasData: true,
    endurance: { address: CHAMPION, duration: 900, lockedDuration: 900, isLive: false },
    chrono: { address: CHAMPION, duration: 1800, lockedDuration: 1800, isLive: false },
    chronoChallenge: {
      address: null,
      recordToBeat: 0,
      isLive: false,
      isRecordHolder: false,
      hasDetails: false,
    },
    lastCst: { address: null },
    latestGesture: {
      address: LATEST,
      holdDuration: 120,
      latestGestureTime: null,
      isCurrentEnduranceChampion: false,
      isExtendingEnduranceRecord: false,
      durationToBeat: 900,
      secondsUntilEnduranceChampion: 780,
      progressToEnduranceChampion: 13,
    },
    raw: null,
    source: 'api-v1',
    ...overrides,
  };
}

function renderPage(props: Parameters<typeof ExperimentalHomePage>[0] = {}) {
  return render(<ExperimentalHomePage {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
  resetUxScenarioForTest();
  window.history.pushState({}, '', '/experimental-ui');
  window.localStorage.clear();
  mockAccount = null;
  mockMediaQuery.mockReturnValue(false);
  mockUseDashboardInfo.mockReturnValue({ data: makeDashboard(), isLoading: false });
  mockUseHomeGestureFeed.mockReturnValue({ data: [] });
  mockUseCSTInfo.mockReturnValue({ data: undefined });
  mockUseDonationsNFTByRound.mockReturnValue({ data: [] });
  mockUseDonationsERC20ByRound.mockReturnValue({ data: [] });
  mockChampions.mockReturnValue(makeChampions());
  mockFetchEndgameChainSample.mockReset();
  mockFetchEndgameChainSample.mockReturnValue(new Promise(() => undefined));
  mockSpecialSnapshot.mockReturnValue({ snapshot: null, isLoading: false });
  mockTickingNow = null;
  mockDeadlineUpdatedAt = Date.now();
  mockFreshness = { state: 'live', ageMs: 0 };
  Object.assign(mockGestureForm, {
    gestureType: 'ETH',
    message: '',
    rwlkId: -1,
    isGesturing: false,
    gestureTxStage: { status: 'idle' },
  });
  Object.assign(mockAllocationFinalize, {
    allocationTime: Date.now() + 13 * 3600_000,
    activationTime: 0,
    isClaiming: false,
    timeoutFinalize: 600,
  });
  mockGestureForm.onGesture.mockResolvedValue(true);
});

/* ── Tests ──────────────────────────────────────────────────────── */

describe('ExperimentalHomePage', () => {
  it('leads with the shared page header, one H1 above the stage', () => {
    renderPage();

    const header = screen.getByTestId('home-deck-header');
    expect(
      within(header).getByRole('heading', { level: 1, name: 'home.deck.artViewTitle' }),
    ).toBeInTheDocument();
    expect(within(header).getByText('home.hero.cycleNumber(number=5)')).toBeInTheDocument();
    // V214: a preview names itself, marks itself beside the cycle, says on
    // that mark what differs, and offers a way back and a way to send
    // feedback, all without a lede that would push the art down (V213).
    expect(within(header).getByTestId('experimental-ui-preview')).toHaveTextContent(
      'home.deck.previewBadge',
    );
    expect(
      within(header).getByRole('button', { name: /home\.deck\.previewBadge/ }),
    ).toHaveAccessibleDescription('home.deck.artViewIntro');
    const back = within(header).getByTestId('experimental-ui-return');
    expect(back).toHaveAttribute('href', '/');
    expect(back).toHaveTextContent('home.deck.backToObservatory');
    const feedback = within(header).getByTestId('experimental-ui-feedback');
    expect(feedback).toHaveAttribute('href', expect.stringMatching(/^https:\/\/discord\.gg\//));
    expect(feedback).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('keeps the header to one row above the art: no standing lede, one route to the walkthrough', () => {
    renderPage();

    const header = screen.getByTestId('home-deck-header');
    // The art leads: no two-sentence lede and no related-pages row push it down.
    expect(header.querySelector('header p.type-lede')).toBeNull();
    expect(within(header).queryByRole('navigation')).not.toBeInTheDocument();
    // One link, shorter from 1024px, where it shares the row with the H1.
    const route = within(header).getByTestId('experimental-ui-new-here');
    expect(within(header).getAllByRole('link', { name: /home\.deck\.newHere/ })).toEqual([route]);
    expect(route).toHaveAttribute('href', '/how-it-works');
    expect(within(route).getByText('home.deck.newHere')).toHaveClass('lg:hidden');
    expect(within(route).getByText('home.deck.howItWorks')).toHaveClass('max-lg:hidden');
    // A compact H1 lets the plate start high.
    expect(header.querySelector('header')).toHaveClass('[&_h1]:type-heading-1');
  });

  it('draws the bell in the same control shape as "Back to the Observatory"', () => {
    renderPage();

    // The menu's own round shape and faint edge give way to the control
    // radius and the outline button's edge. cn() does not read the
    // rounded-control token as a radius, so a regression here keeps the
    // circle (rounded-full wins in the generated CSS).
    const bell = within(screen.getByTestId('home-deck-header')).getByTestId(
      'attention-menu-trigger',
    );
    expect(bell).not.toHaveClass('rounded-full');
    expect(bell).not.toHaveClass('border-rule');
    expect(bell).toHaveClass('rounded-[var(--radius-control)]', 'border-input');
  });

  it('hangs the art beside the monument, with the standings under the art', () => {
    renderPage();

    const deck = screen.getByTestId('home-deck-layout');
    const art = within(deck).getByTestId('home-art-hero');
    const monument = within(deck).getByTestId('home-deck-monument');
    const board = within(deck).getByTestId('home-deck-board');
    // Reading order (and the phone order): art, then the clock and console, then standings.
    expect(art.compareDocumentPosition(monument) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(monument.compareDocumentPosition(board) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(monument).getByRole('timer')).toBeInTheDocument();
    // The one standings ledger of the app, the Observatory's own.
    expect(within(board).getByTestId('standings-ledger')).toBeInTheDocument();
    expect(screen.getByTestId('home-deck-header').compareDocumentPosition(deck)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('keeps Endurance Champion and Final CST Gesture as peer standings', () => {
    renderPage();

    const board = screen.getByTestId('home-deck-board');
    for (const testId of [
      'latest-participant-intel',
      'control-desk-endurance',
      'chrono-role-summary',
      'final-cst-role-summary',
    ]) {
      expect(within(board).getByTestId(testId)).toBeInTheDocument();
    }
    // The links row holds navigation only.
    expect(
      within(screen.getByTestId('home-links-row')).queryByTestId('final-cst-role-summary'),
    ).toBeNull();
  });

  it('feeds the standings the shared champions derivation, seeded with the page clock', () => {
    const sampledAtMs = Math.floor(Date.now() / 1000) * 1000 - 5_000;
    const special = { EnduranceChampionAddress: CHAMPION } as never;
    renderPage({
      initialSpecialRecipients: special,
      initialTimingSample: {
        targetServerTimeSec: sampledAtMs / 1000 + 13 * 3600,
        currentServerTimeSec: sampledAtMs / 1000,
        sampledAtMs,
      },
    });

    // (initial snapshot, latest participant evidence, enabled, page clock)
    expect(mockChampions).toHaveBeenCalledWith(
      special,
      expect.anything(),
      true,
      expect.any(Number),
    );
    expect(mockChampions.mock.calls[0]![1]).toEqual({ address: LATEST, timestamp: null });
  });

  it('has one gesture form: one console, one message field, one submit', () => {
    mockAccount = '0xUser';
    renderPage();

    const monument = screen.getByTestId('home-deck-monument');
    expect(within(monument).getByTestId('gesture-console')).toHaveAttribute('id', 'make-gesture');
    expect(screen.getAllByTestId('gesture-console')).toHaveLength(1);
    expect(screen.getAllByTestId('gesture-message-input')).toHaveLength(1);
    expect(document.querySelectorAll('#gesture-submit')).toHaveLength(1);
    expect(screen.queryByTestId('gesture-composer')).not.toBeInTheDocument();
  });

  it('asks a visitor without a wallet to connect in one place only', () => {
    renderPage();

    expect(screen.getAllByTestId('connect-to-gesture')).toHaveLength(1);
    expect(screen.getAllByTestId('connect-wallet-button')).toHaveLength(1);
    expect(screen.queryByText('home.form.preview')).not.toBeInTheDocument();
  });

  it('prices every method on its segment and drops the separate price tiles', () => {
    renderPage();

    const selector = screen.getByTestId('gesture-method-selector');
    expect(within(selector).getAllByRole('radio')).toHaveLength(3);
    expect(within(selector).getAllByRole('radio')[0]).toHaveTextContent('0.01 ETH');
    expect(screen.queryByTestId('gesture-status')).not.toBeInTheDocument();
  });

  it('shows one allocation view, not a list beside a grid', () => {
    renderPage();

    const boards = screen.getAllByTestId('allocation-tracks-board');
    expect(boards).toHaveLength(1);
    expect(screen.queryByText('home.allocation.title')).not.toBeInTheDocument();
    expect(within(boards[0]!).getByTestId('track-row-stellar-eth')).toHaveTextContent(
      'home.allocation.amounts.ethEach',
    );
  });

  it('ends without a second hero, a legacy NFT strip or an alarm vignette', () => {
    renderPage();

    expect(screen.queryByTestId('home-story-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('latest-nfts')).not.toBeInTheDocument();
    expect(screen.queryByTestId('final-window-vignette')).not.toBeInTheDocument();
    expect(screen.getByTestId('cycle-phase-guide')).toBeInTheDocument();
  });

  it('keeps the heading outline in order: one H1, then H2 sections', () => {
    renderPage();

    const levels = screen
      .getAllByRole('heading')
      .map((heading) => Number(heading.tagName.slice(1)));
    expect(levels[0]).toBe(1);
    // No section heading jumps a level on the way down.
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]!).toBeLessThanOrEqual(1);
    });
    expect(
      screen.getByRole('heading', { level: 2, name: 'home.deck.board.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'home.observatory.standings.title' }),
    ).toBeInTheDocument();
  });

  it('keeps region landmarks for the page’s sections, never nested', () => {
    mockAccount = LATEST;
    renderPage();

    const regions = screen.getAllByRole('region');
    for (const region of regions) {
      expect(within(region).queryAllByRole('region')).toHaveLength(0);
    }
    expect(screen.getByRole('region', { name: 'home.deck.console.title' })).toBeInTheDocument();
    // The clock and the Calibration Window are labelled groups inside it.
    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('role', 'group');
    expect(screen.getByTestId('calibration-window')).toHaveAttribute('role', 'group');
  });

  it('styles the previous-cycle link like the cycle-details link', () => {
    renderPage();

    const current = screen.getByTestId('cycle-details-link-card');
    const previous = screen.getByTestId('previous-cycle-link-card');
    expect(current).toHaveAttribute('href', '/current-cycle');
    expect(previous).toHaveAttribute('href', '/allocation/4');
    expect(previous.className).toBe(current.className);
  });

  it('links the allocations of Cycle 0 from Cycle 1', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboard({ CurRoundNum: 1 }),
      isLoading: false,
    });
    renderPage();

    expect(screen.getByTestId('previous-cycle-link-card')).toHaveAttribute('href', '/allocation/0');
  });

  it('holds Finalize on a tab that returns with a stale deadline until a fresh read lands', () => {
    mockAccount = LATEST;
    Object.assign(mockAllocationFinalize, { allocationTime: Date.now() - 1000 });
    renderPage();
    expect(screen.getByTestId('finalize-submit')).toBeEnabled();

    // The tab was hidden for a minute: a Gesture may have moved the deadline,
    // and a Finalize sent on the old reading would revert and still cost gas.
    mockDeadlineUpdatedAt = Date.now() - 60_000;
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(screen.queryByTestId('finalize-submit')).not.toBeInTheDocument();
    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({ canClaim: false, finalizationConfirmed: false }),
    );
  });

  it('drops the current special recipients after finalizing instead of refetching them', async () => {
    mockAccount = LATEST;
    Object.assign(mockAllocationFinalize, { allocationTime: Date.now() - 1000 });
    renderPage();

    await userEvent.click(screen.getByTestId('finalize-submit'));
    await waitFor(() => expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1));

    // During the rollover the backend answers that read with an error.
    expect(mockCancelQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });
    expect(mockSetQueryData).toHaveBeenCalledWith(['currentSpecialWinners'], null);
    expect(mockInvalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ['currentSpecialWinners'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboardInfo'] });
  });

  it('still refreshes the current special recipients after a Gesture', async () => {
    mockAccount = '0xUser';
    renderPage();

    await userEvent.click(document.getElementById('gesture-submit') as HTMLButtonElement);
    await waitFor(() => expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1));

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['currentSpecialWinners'] });
    expect(mockCancelQueries).not.toHaveBeenCalled();
  });

  it('never lets the tab title count toward a deadline that stopped updating', () => {
    mockFreshness = { state: 'delayed', ageMs: 180_000 };
    renderPage();

    expect(mockTabTitleCountdown).toHaveBeenLastCalledWith(
      expect.objectContaining({ stale: true }),
    );
  });

  it('keeps the transaction with the optimistic chat row', async () => {
    mockAccount = '0xUser';
    mockGestureForm.message = 'hello';
    renderPage();

    await userEvent.click(document.getElementById('gesture-submit') as HTMLButtonElement);
    await waitFor(() => expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1));

    const pending = mockChat.mock.calls.at(-1)![0].pendingMessages as { txHash: string }[];
    expect(pending).toEqual([expect.objectContaining({ message: 'hello', txHash: '0xtxhash' })]);
  });

  it('steps the dock aside while the monument is on screen, at every width', () => {
    const observers: { callback: IntersectionObserverCallback; target: Element }[] = [];
    const original = global.IntersectionObserver;
    global.IntersectionObserver = class {
      private readonly callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        observers.push({ callback: this.callback, target });
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    } as unknown as typeof IntersectionObserver;
    try {
      renderPage();
      const monument = screen.getByTestId('home-deck-monument');
      const report = (isIntersecting: boolean) =>
        act(() => {
          observers
            .filter((observer) => observer.target === monument)
            .forEach(({ callback }) =>
              callback(
                [{ isIntersecting, target: monument } as unknown as IntersectionObserverEntry],
                {} as IntersectionObserver,
              ),
            );
        });

      // Over the header and the art the dock offers the clock and the action.
      report(false);
      expect(mockActionDock).toHaveBeenLastCalledWith(
        expect.objectContaining({ stepAside: false }),
      );
      // The clock and the console are on screen: the dock never repeats them.
      report(true);
      expect(mockActionDock).toHaveBeenLastCalledWith(expect.objectContaining({ stepAside: true }));
    } finally {
      global.IntersectionObserver = original;
    }
  });

  it('routes the phone dock to the same console in a sheet', async () => {
    mockAccount = '0xUser';
    renderPage();

    // The dock quotes the same method and cost as the console, verb and price apart.
    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        submit: {
          action: 'home.form.submit.action.eth',
          cost: expect.stringMatching(/^0\.01\u00a0ETH$/),
        },
      }),
    );
    await userEvent.click(screen.getByTestId('dock-open-sheet'));
    await waitFor(() => expect(screen.getAllByTestId('gesture-console')).toHaveLength(2));
    const sheetConsole = screen
      .getAllByTestId('gesture-console')
      .find((node) => node.getAttribute('data-variant') === 'sheet');
    expect(sheetConsole).not.toHaveAttribute('id');
    // The dialog is named by the one heading it shows, not by a hidden copy.
    const sheet = screen.getByRole('dialog', { name: 'home.deck.console.title' });
    expect(within(sheet).getAllByRole('heading', { name: 'home.deck.console.title' })).toHaveLength(
      1,
    );
  });

  it('submits a Gesture and shows its message in the chat before the indexer does', async () => {
    mockAccount = '0xUser';
    mockGestureForm.message = 'hello';
    renderPage();

    await userEvent.click(document.getElementById('gesture-submit') as HTMLButtonElement);
    await waitFor(() => expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('pending-count')).toHaveTextContent('1');
    // The confirmed Gesture counts at once, on every surface, until the index
    // includes it: the page never writes a guess into the indexed cache.
    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ CurNumBids: 11, LastBidderAddr: '0xUser' }),
      }),
    );
    expect(mockSetQueryData).not.toHaveBeenCalledWith(['dashboardInfo'], expect.anything());
  });

  it('tells the Final Gesture participant how long only they can finalize', () => {
    mockAccount = LATEST;
    Object.assign(mockAllocationFinalize, { allocationTime: Date.now() - 1000 });
    renderPage();

    // timeoutFinalize is 600s, one second of it gone.
    expect(screen.getByTestId('finalize-holder-window')).toHaveTextContent(
      /^home\.deck\.console\.holderWindow\(duration=9m 5\ds\)$/,
    );
    expect(screen.queryByTestId('finalize-wait')).not.toBeInTheDocument();
  });

  it('claims no exclusive window while the finalize timeout is unknown', () => {
    // useAllocationFinalize reports 0 until the timeout read resolves, and
    // again when it fails; the holder may still have their whole window.
    mockAccount = LATEST;
    Object.assign(mockAllocationFinalize, {
      allocationTime: Date.now() - 1000,
      timeoutFinalize: 0,
    });
    renderPage();

    expect(screen.getByTestId('finalize-submit')).toBeEnabled();
    expect(screen.queryByTestId('finalize-holder-window')).not.toBeInTheDocument();
    expect(screen.queryByTestId('finalize-wait')).not.toBeInTheDocument();
  });

  it('lets the eligible wallet finalize from the console', async () => {
    mockAccount = LATEST;
    Object.assign(mockAllocationFinalize, { allocationTime: Date.now() - 1000 });
    renderPage();

    await userEvent.click(screen.getByTestId('finalize-submit'));
    await waitFor(() => expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1));
  });

  it('lets the finalizer finalize from the phone sheet, then closes it', async () => {
    mockAccount = LATEST;
    Object.assign(mockAllocationFinalize, { allocationTime: Date.now() - 1000 });
    renderPage();

    // At zero the dock can finalize for the wallet whose move that is.
    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({ canClaim: true, account: LATEST }),
    );
    await userEvent.click(screen.getByTestId('dock-open-sheet'));
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).queryByTestId('gesture-submit')).not.toBeInTheDocument();
    await userEvent.click(within(sheet).getByTestId('finalize-submit'));
    await waitFor(() => expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('knows the finalizer whatever the case of the address', () => {
    const checksummed = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';
    mockAccount = checksummed.toLowerCase();
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboard({ LastBidderAddr: checksummed }),
      isLoading: false,
    });
    Object.assign(mockAllocationFinalize, { allocationTime: Date.now() - 1000 });
    renderPage();

    expect(screen.queryByTestId('gesture-submit')).not.toBeInTheDocument();
    expect(screen.getByTestId('finalize-submit')).toBeEnabled();
    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({ canClaim: true, account: checksummed.toLowerCase() }),
    );
  });

  it('lets the finalizer finalize straight from the dock', async () => {
    mockAccount = LATEST;
    Object.assign(mockAllocationFinalize, { allocationTime: Date.now() - 1000 });
    renderPage();

    await userEvent.click(screen.getByTestId('dock-finalize'));
    await waitFor(() => expect(mockAllocationFinalize.onFinalize).toHaveBeenCalledTimes(1));
  });

  it('keeps the sheet open while the Gesture is signed and closes it once confirmed', async () => {
    mockAccount = '0xUser';
    let confirm: (confirmed: boolean) => void = () => undefined;
    mockGestureForm.onGesture.mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          confirm = resolve;
        }),
    );
    renderPage();

    await userEvent.click(screen.getByTestId('dock-open-sheet'));
    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getByTestId('gesture-submit'));
    await waitFor(() => expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1));
    // Signing: the sheet, its busy button and its transaction status stay in view.
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => confirm(true));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the sheet open when the Gesture does not go through', async () => {
    mockAccount = '0xUser';
    mockGestureForm.onGesture.mockResolvedValueOnce(false);
    renderPage();

    await userEvent.click(screen.getByTestId('dock-open-sheet'));
    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getByTestId('gesture-submit'));
    await waitFor(() => expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('pending-count')).toHaveTextContent('0');
  });

  it('shows the transaction stage on the dock while a Gesture is in flight', () => {
    mockAccount = '0xUser';
    Object.assign(mockGestureForm, {
      isGesturing: true,
      gestureTxStage: { status: 'awaiting-signature', step: 1, total: 1 },
    });
    renderPage();

    // The shared dock names the stage itself from these.
    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isGesturing: true,
        txStage: { status: 'awaiting-signature', step: 1, total: 1 },
      }),
    );
  });

  it('measures the standings against the sampled clock before the client clock runs', () => {
    const { useChampions: actualChampions } = jest.requireActual<{
      useChampions: typeof useChampions;
    }>('@/hooks/useChampions');
    mockChampions.mockImplementation(actualChampions);
    // Server rendering and hydration: the shared ticker reads 0.
    mockTickingNow = 0;
    const sampledAtMs = Math.floor(Date.now() / 1000) * 1000 - 5_000;
    const heldSeconds = 2 * 3600 + 21 * 60 + 9;
    const gestureAt = sampledAtMs / 1000 - heldSeconds;
    mockUseHomeGestureFeed.mockReturnValue({
      data: [
        {
          EvtLogId: 7,
          BidderAddr: LATEST,
          GestureType: 0,
          GestureCostEth: 0.0102,
          TimeStamp: gestureAt,
          RoundNum: 5,
        } as unknown as GestureInfo,
      ],
    });
    mockSpecialSnapshot.mockReturnValue({
      snapshot: {
        source: 'api-v1',
        receivedAtMs: sampledAtMs,
        hasChronoSegmentData: false,
        hasFinalCstTime: false,
        EnduranceChampionAddress: CHAMPION,
        EnduranceChampionDuration: 7 * 3600 + 3 * 60 + 11,
        ChronoWarriorAddress: CHAMPION,
        ChronoWarriorDuration: 9 * 3600,
        LastBidderAddress: LATEST,
        LastBidderLastBidTime: gestureAt,
      },
      isLoading: false,
    });
    renderPage({
      initialTimingSample: {
        targetServerTimeSec: sampledAtMs / 1000 + 13 * 3600,
        currentServerTimeSec: sampledAtMs / 1000,
        sampledAtMs,
      },
    });

    expect(mockChampions).toHaveBeenLastCalledWith(null, expect.anything(), true, sampledAtMs);
    const latest = screen.getByTestId('latest-participant-intel');
    // The hold as of the sampled instant, never a pending or a false "0s".
    expect(latest).toHaveTextContent('02:21:09');
    // (7h 3m 11s + 1s) − 2h 21m 9s, read as a clock beside its fixed label.
    const countdown = within(latest).getByTestId('latest-endurance-countdown');
    expect(countdown).toHaveTextContent('home.observatory.ledger.passesRecordIn');
    expect(countdown).toHaveTextContent('04:42:03');
  });

  it('counts the wallet’s entries only once the feed holds the whole cycle', () => {
    mockAccount = LATEST;
    // The server seed: the latest Gesture alone, the wallet's own.
    mockUseHomeGestureFeed.mockReturnValue({
      data: [
        { EvtLogId: 9, BidderAddr: LATEST, TimeStamp: 1, RoundNum: 5 } as unknown as GestureInfo,
      ],
      mode: undefined,
      isLoading: true,
    });
    const { unmount } = renderPage();

    expect(screen.getByTestId('personal-gesture-count-pending')).toBeInTheDocument();
    expect(screen.queryByTestId('personal-entry-share')).not.toBeInTheDocument();
    unmount();

    // The whole feed: the dashboard's 10 Gestures are N.
    mockUseHomeGestureFeed.mockReturnValue({
      data: [
        { EvtLogId: 9, BidderAddr: LATEST, TimeStamp: 1, RoundNum: 5 } as unknown as GestureInfo,
      ],
    });
    renderPage();
    expect(screen.getByTestId('personal-entry-share')).toHaveTextContent(
      'home.deck.personal.entryShare(share=10%)',
    );
  });

  it('shows the clock and calendar, not the console, while the next cycle waits', () => {
    Object.assign(mockAllocationFinalize, {
      activationTime: Math.floor(Date.now() / 1000) + 3600,
    });
    renderPage();

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'opening-soon');
    expect(screen.getByTestId('monument-calendar-link')).toBeInTheDocument();
    expect(screen.queryByTestId('gesture-console')).not.toBeInTheDocument();
  });

  it('shows the console skeleton while the dashboard loads', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    renderPage();

    expect(screen.getByTestId('gesture-form-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('monument-clock-loading')).toBeInTheDocument();
  });

  it('replaces the page with a retry when the dashboard cannot be read', async () => {
    const refetch = jest.fn();
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'home.error.title' })).toBeInTheDocument();
    expect(screen.queryByTestId('home-deck-layout')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('brings the console’s message field into focus from the chat', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'join chat' }));
    expect(screen.getByTestId('gesture-message-input')).toHaveFocus();
  });

  it('opens the RandomWalk method from a collection deep link', () => {
    window.history.pushState({}, '', '/experimental-ui?randomwalk=1&tokenId=42');
    renderPage();

    expect(mockGestureForm.setRwlkId).toHaveBeenCalledWith(42);
    expect(mockGestureForm.setBidType).toHaveBeenCalledWith('RandomWalk');
  });

  it.each([
    ['no token id', '/experimental-ui?randomwalk=1'],
    ['an empty token id', '/experimental-ui?randomwalk=1&tokenId='],
    ['text', '/experimental-ui?randomwalk=1&tokenId=abc'],
    ['a fraction', '/experimental-ui?randomwalk=1&tokenId=4.5'],
    ['a negative id', '/experimental-ui?randomwalk=1&tokenId=-3'],
  ])('opens the RandomWalk method without preselecting from %s', (_case, url) => {
    window.history.pushState({}, '', url);
    renderPage();

    expect(mockGestureForm.setBidType).toHaveBeenCalledWith('RandomWalk');
    // Not token #0, not NaN: the viewer picks from the wallet's own list.
    expect(mockGestureForm.setRwlkId).not.toHaveBeenCalled();
  });

  it('remembers the viewer’s pause of the artwork', async () => {
    mockUseCSTInfo.mockReturnValue({ data: { Seed: 'abc', TokenName: '', RoundNum: 1 } });
    renderPage({
      initialBannerToken: { id: 3, info: { TokenId: 3, Seed: 'abc' } as CSTTokenInfo },
    });

    await userEvent.click(screen.getByTestId('art-motion-toggle'));
    expect(window.localStorage.getItem('cosmic-experimental-art-paused')).toBe('1');
    expect(screen.getByTestId('art-motion-toggle')).toHaveAccessibleName('detail.viewer.play');
  });

  it('lists attached assets under the stage when the cycle holds some', () => {
    mockUseDonationsNFTByRound.mockReturnValue({ data: [{ id: 1 }] });
    renderPage();

    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-count', '1');
  });

  it('asks nothing of the first cycle before its first Gesture beyond ETH', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: makeDashboard({ LastBidderAddr: zeroAddress }),
      isLoading: false,
    });
    mockChampions.mockReturnValue(
      makeChampions({
        latestGesture: { ...makeChampions().latestGesture, address: null },
      }),
    );
    act(() => {
      renderPage();
    });

    // The form itself holds ETH, so a CST pick from the previous cycle can
    // neither leave the one radio unchecked nor send a CST first Gesture.
    expect(mockUseGestureFormOptions).toHaveBeenLastCalledWith({ firstGesture: true });
    expect(
      within(screen.getByTestId('gesture-method-selector')).getAllByRole('radio'),
    ).toHaveLength(1);
    expect(screen.getByTestId('latest-participant-intel')).toHaveAttribute('data-empty', 'true');
  });

  it('lets the form keep any method once the cycle has its first Gesture', () => {
    renderPage();

    expect(mockUseGestureFormOptions).toHaveBeenLastCalledWith({ firstGesture: false });
  });
});
