import { render, screen, checkA11y, fireEvent } from '@/test-utils';

import CurrentRoundPage from '../CurrentRoundPage';

const mockUseDashboardInfo = jest.fn();
const mockRefetch = jest.fn();
const mockUseGestureListByCycle = jest.fn();
const mockUseDonationsNFTByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsCGWithInfoByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsERC20ByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseCurrentTime = jest.fn().mockReturnValue({ data: undefined });
const mockUseAllocationFinalize = jest.fn();
const mockUseEndgameChainSync = jest.fn();
const mockFreshness = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useDonationsCGWithInfoByRound: (...args: unknown[]) => mockUseDonationsCGWithInfoByRound(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));

jest.mock('../../../../../hooks/useAllocationFinalize', () => ({
  useAllocationFinalize: (...args: unknown[]) => mockUseAllocationFinalize(...args),
}));

jest.mock('../../../../../hooks/useEndgameChainSync', () => ({
  useEndgameChainSync: (...args: unknown[]) => mockUseEndgameChainSync(...args),
}));

jest.mock('../../../../../hooks/useLiveFreshness', () => ({
  useLiveFreshness: () => mockFreshness(),
}));

jest.mock('../components/CycleDetails', () => ({
  CycleDetails: (props: Record<string, unknown>) => (
    <div
      data-testid="cycle-details"
      data-nfts={(props.attachedNfts as unknown[]).length}
      data-erc20={(props.attachedErc20 as unknown[]).length}
      data-gestures-loading={String(props.gesturesLoading)}
    />
  ),
}));

jest.mock('../components/CycleStandings', () => ({
  CycleStandings: (props: {
    latestParticipantAddress?: string | null;
    latestGesture?: { EvtLogId?: number; Message?: string } | null;
  }) => (
    <div
      data-testid="special-allocation-recipients"
      data-message={props.latestGesture?.Message ?? ''}
      data-gesture-id={props.latestGesture?.EvtLogId ?? ''}
      data-latest-address={props.latestParticipantAddress ?? ''}
    />
  ),
}));

const NOW_SEC = Math.floor(Date.now() / 1000);
const PARTICIPANT = '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12';
const ZERO = '0x0000000000000000000000000000000000000000';

const baseDashboardData = {
  CurRoundNum: 42,
  CurNumBids: 137,
  TsRoundStart: NOW_SEC - 7200,
  LastBidderAddr: PARTICIPANT,
  PrizeAmountEth: 5.1234,
  RaffleAmountEth: 1.5,
  CosmicGameBalanceEth: 20,
  CharityPercentage: 10,
  StakingAmountEth: 2,
  CurRoundStats: {
    TotalBids: 137,
    TotalDonatedAmountEth: 0.75,
    TotalDonatedNFTs: 4,
  },
  MainStats: {},
};

function setupLoaded(overrides: Record<string, unknown> = {}, query: Record<string, unknown> = {}) {
  const data = { ...baseDashboardData, ...overrides };
  mockUseDashboardInfo.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    ...query,
  });
}

function clock(allocationSec: number, activationSec = NOW_SEC - 3600) {
  mockUseAllocationFinalize.mockReturnValue({
    allocationTime: allocationSec * 1000,
    activationTime: activationSec,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue({ data: [], isPending: false, isError: false });
  mockUseDonationsNFTByRound.mockReturnValue({ data: [] });
  mockUseDonationsCGWithInfoByRound.mockReturnValue({ data: [] });
  mockUseDonationsERC20ByRound.mockReturnValue({ data: [] });
  mockFreshness.mockReturnValue({ state: 'live', ageMs: 0, lastSuccessAtMs: Date.now() });
  mockUseEndgameChainSync.mockReturnValue({
    isConfirmationPending: false,
    isClaimedOnChain: false,
    lastSample: null,
  });
  clock(NOW_SEC + 20 * 3600);
});

describe('CurrentRoundPage', () => {
  it('shows a skeleton while the first read is in flight', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<CurrentRoundPage />);
    expect(screen.getByRole('status')).toHaveAccessibleName('common.status.loading');
  });

  it('shows the error state only when nothing has ever loaded, and retries by refetching', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    render(<CurrentRoundPage />);
    expect(screen.getByText('currentCycle.error.title')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry|try/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the page when a background poll fails after a successful load', () => {
    setupLoaded({}, { isError: true, isRefetchError: true });
    mockFreshness.mockReturnValue({ state: 'delayed', ageMs: 60_000, lastSuccessAtMs: 1 });
    render(<CurrentRoundPage />);

    expect(screen.queryByText('currentCycle.error.title')).not.toBeInTheDocument();
    expect(screen.getByText('currentCycle.hero.title(n=42)')).toBeInTheDocument();
    // The phase keeps its name but stops breathing, and the clock says it may be stale.
    expect(screen.getByTestId('live-badge')).toHaveAttribute('data-tone', 'neutral');
    expect(screen.getByText(/common\.liveStatus\.delayedCaveat/)).toBeInTheDocument();
  });

  it('renders the server header first, as the page’s only header', () => {
    setupLoaded();
    render(<CurrentRoundPage seoSummary={<h1>Current cycle</h1>} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'currentCycle.hero.title(n=42)',
    );
  });

  it('names a running clock with the home clock’s live phase and a breathing badge', () => {
    setupLoaded();
    render(<CurrentRoundPage />);

    const badge = screen.getByTestId('live-badge');
    expect(badge).toHaveTextContent('home.chrono.phase.live.label');
    expect(badge).toHaveAttribute('data-tone', 'live');
    expect(screen.getByRole('timer')).toHaveTextContent(/\d+:\d\d:\d\d/);
    expect(screen.getByText('home.chrono.phase.live.status')).toBeInTheDocument();
  });

  it('says "Confirming", not live, while the zero-cross awaits on-chain verification', () => {
    setupLoaded();
    clock(NOW_SEC - 60);
    mockUseEndgameChainSync.mockReturnValue({
      isConfirmationPending: true,
      isClaimedOnChain: false,
      lastSample: null,
    });
    render(<CurrentRoundPage />);

    const badge = screen.getByTestId('live-badge');
    expect(badge).toHaveTextContent('home.chrono.phase.confirming.label');
    expect(badge).toHaveAttribute('data-tone', 'attention');
    expect(screen.queryByText('home.chrono.phase.live.label')).not.toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('shows the ready state and points the finalize action at the home clock', () => {
    setupLoaded();
    clock(NOW_SEC - 60);
    render(<CurrentRoundPage />);

    expect(screen.getByTestId('live-badge')).toHaveTextContent(
      'home.chrono.phase.readyToFinalize.label',
    );
    expect(
      screen.getByRole('link', { name: /currentCycle\.hero\.cta\.finalizeCycle/ }),
    ).toHaveAttribute('href', '/');
  });

  it('counts down to the opening before the cycle opens, with no standings', () => {
    const activationSec = NOW_SEC + 3600;
    setupLoaded({ TsRoundStart: 0, LastBidderAddr: ZERO });
    clock(0, activationSec);
    render(<CurrentRoundPage />);

    expect(screen.getByTestId('live-badge')).toHaveTextContent(
      'home.chrono.phase.openingSoon.label',
    );
    expect(
      screen.getByText(/currentCycle\.hero\.countdown\.opensAt\(n=42,date=.+\)/),
    ).toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(screen.queryByTestId('special-allocation-recipients')).not.toBeInTheDocument();
  });

  it('asks for the first gesture when the open cycle has none', () => {
    setupLoaded({ TsRoundStart: 0, LastBidderAddr: ZERO });
    clock(0, NOW_SEC - 60);
    render(<CurrentRoundPage />);

    expect(
      screen.getByRole('link', { name: /currentCycle\.hero\.cta\.makeFirstGesture/ }),
    ).toHaveAttribute('href', '/#make-gesture');
    expect(screen.queryByTestId('special-allocation-recipients')).not.toBeInTheDocument();
  });

  it('points "Make a Gesture" at the home gesture form', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(
      screen.getByRole('link', { name: /currentCycle\.hero\.cta\.makeGesture/ }),
    ).toHaveAttribute('href', '/#make-gesture');
  });

  it('lists the cycle figures the header does not show', () => {
    setupLoaded();
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        { EvtLogId: 1, BidderAddr: PARTICIPANT, TimeStamp: NOW_SEC },
        { EvtLogId: 2, BidderAddr: PARTICIPANT, TimeStamp: NOW_SEC },
        { EvtLogId: 3, BidderAddr: '0x1111111111111111111111111111111111111111', TimeStamp: 1 },
      ],
      isPending: false,
      isError: false,
    });
    const { container } = render(<CurrentRoundPage />);
    const figure = (id: string) => container.querySelector(`[data-figure="${id}"] dd`);

    expect(figure('reserve')).toHaveTextContent('20.0000');
    expect(figure('participants')).toHaveTextContent('2');
    expect(figure('contributed')).toHaveTextContent('0.7500');
    expect(figure('attachedNfts')).toHaveTextContent('4');
    // The Signature Allocation is a header figure, shown once per page.
    expect(screen.queryByText('5.1234')).not.toBeInTheDocument();
  });

  it('passes the latest gesture and its message to the standings', () => {
    setupLoaded();
    mockUseGestureListByCycle.mockReturnValue({
      data: [{ EvtLogId: 77, BidderAddr: PARTICIPANT, TimeStamp: NOW_SEC, Message: 'gm' }],
      isPending: false,
      isError: false,
    });
    render(<CurrentRoundPage />);
    const standings = screen.getByTestId('special-allocation-recipients');
    expect(standings).toHaveAttribute('data-message', 'gm');
    expect(standings).toHaveAttribute('data-gesture-id', '77');
    expect(standings).toHaveAttribute('data-latest-address', PARTICIPANT);
  });

  it('hands the cycle’s attached assets to one section, with no second showcase', () => {
    setupLoaded();
    mockUseDonationsNFTByRound.mockReturnValue({ data: [{ RecordId: 1 }, { RecordId: 2 }] });
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: [{ EvtLogId: 1, TokenAddr: '0xToken', AmountDonatedEth: 5 }],
    });
    render(<CurrentRoundPage />);
    expect(mockUseDonationsNFTByRound).toHaveBeenCalledWith(42);
    expect(screen.queryByTestId('attached-nft-showcase')).not.toBeInTheDocument();
    expect(screen.getByTestId('cycle-details')).toHaveAttribute('data-nfts', '2');
    expect(screen.getByTestId('cycle-details')).toHaveAttribute('data-erc20', '1');
  });

  it('has no accessibility violations', async () => {
    setupLoaded();
    const { container } = render(<CurrentRoundPage />);
    await checkA11y(container);
  }, 15_000);
});
