import userEvent from '@testing-library/user-event';
import { zeroAddress } from 'viem';

import { resetUxScenarioForTest } from '@/lib/uxCycleScenarios';
import type { useChampionsAtClock } from '@/components/home/experimental/useChampionsAtClock';
import type { ChampionsState } from '@/hooks/useChampions';
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

type ChampionsAtClockArgs = Parameters<typeof useChampionsAtClock>[0];
const mockChampions = jest.fn<ChampionsState, [ChampionsAtClockArgs]>();
jest.mock('@/components/home/experimental/useChampionsAtClock', () => ({
  useChampionsAtClock: (args: ChampionsAtClockArgs) => mockChampions(args),
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
};

jest.mock('@/hooks/useGestureForm', () => ({
  useGestureForm: () => mockGestureForm,
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
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
    setQueryData: mockSetQueryData,
    getQueryCache: () => ({
      subscribe: () => () => undefined,
      findAll: () => [],
      getAll: () => [],
    }),
  }),
}));

jest.mock('@/hooks/useLiveFreshness', () => ({
  useLiveFreshness: () => ({ state: 'live', ageMs: 0 }),
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

const mockActionDock = jest.fn(
  (props: { submitLabel: string; onOpenSheet: () => void; className?: string }) => (
    <div data-testid="action-dock" data-hidden={String(props.className === 'hidden')}>
      <button type="button" data-testid="dock-open-sheet" onClick={props.onOpenSheet}>
        {props.submitLabel}
      </button>
    </div>
  ),
);
jest.mock('@/components/home/observatory/ActionDock', () => ({
  ActionDock: (props: { submitLabel: string; onOpenSheet: () => void; className?: string }) =>
    mockActionDock(props),
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
  mockSpecialSnapshot.mockReturnValue({ snapshot: null, isLoading: false });
  mockTickingNow = null;
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
  });
  mockGestureForm.onGesture.mockResolvedValue(true);
});

/* ── Tests ──────────────────────────────────────────────────────── */

describe('ExperimentalHomePage', () => {
  it('leads with the shared page header, one H1 above the stage', () => {
    renderPage();

    const header = screen.getByTestId('home-deck-header');
    expect(
      within(header).getByRole('heading', { level: 1, name: 'home.deck.title' }),
    ).toBeInTheDocument();
    expect(within(header).getByText('home.hero.cycleNumber(number=5)')).toBeInTheDocument();
    expect(within(header).getByTestId('experimental-ui-return')).toHaveAttribute('href', '/');
    expect(within(header).getByRole('link', { name: /home\.deck\.newHere/ })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
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
    expect(within(board).getByTestId('standings-ledger')).toBeInTheDocument();
    expect(screen.getByTestId('home-deck-header').compareDocumentPosition(deck)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('keeps Endurance Champion and Final CST Gesture as peer standings', () => {
    renderPage();

    const board = screen.getByTestId('home-deck-board');
    for (const key of ['latest', 'endurance', 'chrono', 'lastcst']) {
      expect(within(board).getByTestId(`standing-${key}`)).toBeInTheDocument();
    }
    // The links row holds navigation only.
    expect(
      within(screen.getByTestId('home-links-row')).queryByTestId('standing-lastcst'),
    ).toBeNull();
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
      screen.getByRole('heading', { level: 2, name: 'home.deck.standings.title' }),
    ).toBeInTheDocument();
  });

  it('styles the previous-cycle link like the cycle-details link', () => {
    renderPage();

    const current = screen.getByTestId('cycle-details-link-card');
    const previous = screen.getByTestId('previous-cycle-link-card');
    expect(current).toHaveAttribute('href', '/current-cycle');
    expect(previous).toHaveAttribute('href', '/allocation/4');
    expect(previous.className).toBe(current.className);
  });

  it('routes the phone dock to the same console in a sheet', async () => {
    mockAccount = '0xUser';
    renderPage();

    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({ submitLabel: 'home.form.submit.eth(cost=0.01)' }),
    );
    await userEvent.click(screen.getByTestId('dock-open-sheet'));
    await waitFor(() => expect(screen.getAllByTestId('gesture-console')).toHaveLength(2));
    const sheetConsole = screen
      .getAllByTestId('gesture-console')
      .find((node) => node.getAttribute('data-variant') === 'sheet');
    expect(sheetConsole).not.toHaveAttribute('id');
  });

  it('submits a Gesture and shows its message in the chat before the indexer does', async () => {
    mockAccount = '0xUser';
    mockGestureForm.message = 'hello';
    renderPage();

    await userEvent.click(document.getElementById('gesture-submit') as HTMLButtonElement);
    await waitFor(() => expect(mockGestureForm.onGesture).toHaveBeenCalledTimes(1));
    expect(mockSetQueryData).toHaveBeenCalledWith(['dashboardInfo'], expect.any(Function));
    expect(screen.getByTestId('pending-count')).toHaveTextContent('1');
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

    // At zero the dock names the move that is this wallet's to make.
    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({ submitLabel: 'home.form.finalize' }),
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
      expect.objectContaining({ submitLabel: 'home.form.finalize' }),
    );
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

    expect(mockActionDock).toHaveBeenLastCalledWith(
      expect.objectContaining({ submitLabel: 'toasts.tx.button.confirm' }),
    );
  });

  it('measures the standings against the sampled clock before the client clock runs', () => {
    const { useChampionsAtClock: actualChampionsAtClock } = jest.requireActual<{
      useChampionsAtClock: typeof useChampionsAtClock;
    }>('@/components/home/experimental/useChampionsAtClock');
    mockChampions.mockImplementation(actualChampionsAtClock);
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

    expect(mockChampions).toHaveBeenLastCalledWith(expect.objectContaining({ nowMs: sampledAtMs }));
    const latest = screen.getByTestId('standing-latest');
    // The hold as of the sampled instant, the same instant as "2 hours ago".
    expect(latest).toHaveTextContent('2h 21m 9s');
    expect(latest).toHaveTextContent('2 hours ago');
    expect(within(latest).queryByTestId('standing-pending-figure')).not.toBeInTheDocument();
    // (7h 3m 11s + 1s) − 2h 21m 9s.
    expect(screen.getByTestId('standing-latest-progress')).toHaveTextContent(
      'tables.specialAllocation.needsToBecomeChampion(duration=4h 42m 3s)',
    );
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

    expect(
      within(screen.getByTestId('gesture-method-selector')).getAllByRole('radio'),
    ).toHaveLength(1);
    expect(screen.getByTestId('standing-latest')).toHaveAttribute('data-state', 'empty');
  });
});
