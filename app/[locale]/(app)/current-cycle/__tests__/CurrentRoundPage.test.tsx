import { render, screen, checkA11y } from '@/test-utils';

import CurrentRoundPage from '../CurrentRoundPage';

const mockUseDashboardInfo = jest.fn();
const mockUseGestureListByCycle = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsNFTByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsCGWithInfoByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseDonationsERC20ByRound = jest.fn().mockReturnValue({ data: [] });
const mockUseCurrentTime = jest.fn().mockReturnValue({ data: undefined });
const mockUseAllocationFinalize = jest.fn().mockReturnValue({
  allocationTime: 0,
  activationTime: 0,
});
const mockUseEndgameChainSync = jest.fn().mockReturnValue({
  isConfirmationPending: false,
  isClaimedOnChain: false,
  lastSample: null,
});
const mockCountdownProps: Array<Record<string, unknown>> = [];

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

jest.mock('../../../../../components/common/SmoothCountdown', () => ({
  SmoothCountdown: (props: { date: number }) => {
    mockCountdownProps.push(props as Record<string, unknown>);
    return <div data-testid="countdown">countdown-target:{props.date}</div>;
  },
}));

jest.mock('../../../../../components/common/Counter', () => ({
  __esModule: true,
  default: () => <div data-testid="counter" />,
}));

jest.mock('../../../../../components/home/RoundInfoSection', () => ({
  RoundInfoSection: (props: Record<string, unknown>) => (
    <div
      data-testid="round-info-section"
      data-round={props.data ? 'loaded' : 'none'}
      data-nfts={(props.donatedNFTs as unknown[] | undefined)?.length ?? 0}
      data-erc20={(props.donatedERC20Tokens as unknown[] | undefined)?.length ?? 0}
    >
      RoundInfoSection
    </div>
  ),
}));

jest.mock('../../../../../components/attachments/DonatedNFTPrizeShowcase', () => ({
  AttachedNFTAllocationShowcase: ({
    nfts,
    erc20Tokens = [],
    cycleNumber,
  }: {
    nfts: unknown[];
    erc20Tokens?: unknown[];
    cycleNumber?: number;
  }) =>
    nfts.length > 0 || erc20Tokens.length > 0 ? (
      <section
        data-testid="attached-nft-showcase"
        data-count={nfts.length}
        data-erc20-count={erc20Tokens.length}
        data-cycle={cycleNumber}
      >
        Attached NFT Showcase
      </section>
    ) : null,
}));

jest.mock('../../../../../components/tables/SpecialAllocationRecipients', () => ({
  SpecialAllocationRecipients: (props: {
    latestParticipantAddress?: string | null;
    latestMessage?: string;
    latestGesture?: { EvtLogId?: number } | null;
    showLastGesture?: boolean;
  }) => (
    <div
      data-testid="special-allocation-recipients"
      data-message={props.latestMessage ?? ''}
      data-gesture-id={props.latestGesture?.EvtLogId ?? ''}
      data-latest-address={props.latestParticipantAddress ?? ''}
      data-show-last-gesture={String(props.showLastGesture ?? false)}
    >
      Special Allocations
    </div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue({ data: [] });
  mockUseDonationsNFTByRound.mockReturnValue({ data: [] });
  mockUseDonationsCGWithInfoByRound.mockReturnValue({ data: [] });
  mockUseDonationsERC20ByRound.mockReturnValue({ data: [] });
  mockUseAllocationFinalize.mockReturnValue({
    allocationTime: 0,
    activationTime: 0,
  });
  mockUseEndgameChainSync.mockReturnValue({
    isConfirmationPending: false,
    isClaimedOnChain: false,
    lastSample: null,
  });
  mockCountdownProps.length = 0;
});

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
  GestureCostEth: 0.01,
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
    expect(screen.getByText('currentCycle.error.title')).toBeInTheDocument();
  });

  it('renders error state when data is null', () => {
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false, isError: false });
    render(<CurrentRoundPage />);
    expect(screen.getByText('currentCycle.error.title')).toBeInTheDocument();
  });

  it('renders round number in heading', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('currentCycle.hero.title(n=42)')).toBeInTheDocument();
  });

  it('renders LIVE badge', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByTestId('live-badge')).toHaveTextContent('currentCycle.hero.status.live');
  });

  it('renders gesture count in subtitle', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(
      screen.getByText(/currentCycle\.hero\.subtitle\(date=.+,count=137\)/),
    ).toBeInTheDocument();
  });

  it('renders all 6 stat cards with correct values', () => {
    setupLoaded();
    render(<CurrentRoundPage />);

    expect(screen.getByText('currentCycle.stats.totalGestures.label')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.stats.cycleReserve.label')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.stats.stellarSelectionPool.label')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.stats.publicGoods.label')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.stats.contributedEth.label')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.stats.attachedNfts.label')).toBeInTheDocument();
  });

  it('displays formatted allocation pool value', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('5.1234 ETH')).toBeInTheDocument();
  });

  it('displays formatted stellar selection pool value', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
  });

  it('displays computed public goods amount', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByText('2.0000 ETH')).toBeInTheDocument();
  });

  it('renders pre-activation countdown when the cycle has not opened yet', () => {
    const activationSec = NOW_SEC + 3600;
    setupLoaded({ TsRoundStart: 0 });
    mockUseAllocationFinalize.mockReturnValue({
      allocationTime: 0,
      activationTime: activationSec,
    });
    render(<CurrentRoundPage />);

    expect(screen.getByText('currentCycle.hero.status.openingSoon')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.hero.countdown.opensIn')).toBeInTheDocument();
    expect(
      screen.getByText(/currentCycle\.hero\.countdown\.opensAt\(n=42,date=.+\)/),
    ).toBeInTheDocument();
    expect(screen.getByTestId('countdown')).toBeInTheDocument();
    expect(mockCountdownProps).toEqual(
      expect.arrayContaining([expect.objectContaining({ date: activationSec * 1000 })]),
    );
    expect(screen.queryByText('currentCycle.hero.countdown.finalizesIn')).not.toBeInTheDocument();
  });

  it('renders countdown timer when allocation time is in the future', () => {
    const futureTimeMs = (NOW_SEC + 3600) * 1000;
    setupLoaded();
    mockUseAllocationFinalize.mockReturnValue({
      allocationTime: futureTimeMs,
      activationTime: NOW_SEC - 60,
    });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC, dataUpdatedAt: NOW_SEC * 1000 });
    render(<CurrentRoundPage />);

    expect(screen.getByText('currentCycle.hero.countdown.finalizesIn')).toBeInTheDocument();
    expect(screen.getByTestId('countdown')).toBeInTheDocument();
    expect(mockCountdownProps).toEqual(
      expect.arrayContaining([expect.objectContaining({ date: futureTimeMs })]),
    );
  });

  it('renders ready-to-finalize state when countdown has passed', () => {
    const pastTimeMs = (NOW_SEC - 60) * 1000;
    setupLoaded();
    mockUseAllocationFinalize.mockReturnValue({
      allocationTime: pastTimeMs,
      activationTime: NOW_SEC - 3600,
    });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC, dataUpdatedAt: NOW_SEC * 1000 });
    render(<CurrentRoundPage />);

    expect(screen.getByText('currentCycle.hero.countdown.readyTitle')).toBeInTheDocument();
    expect(screen.getByText('currentCycle.hero.countdown.readyMessage')).toBeInTheDocument();
  });

  it('holds in the confirming state while the zero-cross awaits on-chain verification', () => {
    const pastTimeMs = (NOW_SEC - 60) * 1000;
    setupLoaded();
    mockUseAllocationFinalize.mockReturnValue({
      allocationTime: pastTimeMs,
      activationTime: NOW_SEC - 3600,
    });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC, dataUpdatedAt: NOW_SEC * 1000 });
    mockUseEndgameChainSync.mockReturnValue({
      isConfirmationPending: true,
      isClaimedOnChain: false,
      lastSample: null,
    });
    render(<CurrentRoundPage />);

    expect(screen.getByText('currentCycle.hero.countdown.confirmingTitle')).toBeInTheDocument();
    expect(screen.queryByText('currentCycle.hero.countdown.readyTitle')).not.toBeInTheDocument();
  });

  it('does not show countdown or exhausted state when no last participant', () => {
    setupLoaded({ LastBidderAddr: '0x0000000000000000000000000000000000000000' });
    mockUseAllocationFinalize.mockReturnValue({
      allocationTime: (NOW_SEC + 3600) * 1000,
      activationTime: NOW_SEC - 60,
    });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC });
    render(<CurrentRoundPage />);

    expect(screen.queryByText('currentCycle.hero.countdown.finalizesIn')).not.toBeInTheDocument();
    expect(screen.queryByText('currentCycle.hero.countdown.readyTitle')).not.toBeInTheDocument();
  });

  it('does not render duplicate standalone latest participant card', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.queryByText('Last Participant — Current Leader')).not.toBeInTheDocument();
  });

  it('does not show last participant when address is zero', () => {
    setupLoaded({ LastBidderAddr: '0x0000000000000000000000000000000000000000' });
    render(<CurrentRoundPage />);
    expect(screen.queryByText('Last Participant — Current Leader')).not.toBeInTheDocument();
  });

  it('renders SpecialAllocationRecipients in hero when there is a last participant', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    expect(screen.getByTestId('special-allocation-recipients')).toBeInTheDocument();
  });

  it('passes the complete latest gesture and message to SpecialAllocationRecipients', () => {
    setupLoaded();
    mockUseGestureListByCycle.mockReturnValue({
      data: [
        {
          EvtLogId: 77,
          BidderAddr: baseDashboardData.LastBidderAddr,
          TimeStamp: NOW_SEC,
          Message: 'gm',
        },
      ],
    });
    render(<CurrentRoundPage />);
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-message',
      'gm',
    );
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-gesture-id',
      '77',
    );
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-latest-address',
      baseDashboardData.LastBidderAddr,
    );
    expect(screen.getByTestId('special-allocation-recipients')).toHaveAttribute(
      'data-show-last-gesture',
      'true',
    );
  });

  it('does not render SpecialAllocationRecipients when no last participant', () => {
    setupLoaded({ LastBidderAddr: '0x0000000000000000000000000000000000000000' });
    render(<CurrentRoundPage />);
    expect(screen.queryByTestId('special-allocation-recipients')).not.toBeInTheDocument();
  });

  it('renders "Make a Gesture" CTA link', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    const cta = screen.getByRole('link', { name: /currentCycle\.hero\.cta\.makeGesture/ });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/');
  });

  it('renders "Back to Home" navigation link', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    const link = screen.getByRole('link', { name: /currentCycle\.nav\.backToHome/ });
    expect(link).toHaveAttribute('href', '/');
  });

  it('passes data to RoundInfoSection', () => {
    setupLoaded();
    render(<CurrentRoundPage />);
    const section = screen.getByTestId('round-info-section');
    expect(section).toHaveAttribute('data-round', 'loaded');
  });

  it('renders the attached NFT showcase near the top when current-cycle NFTs exist', () => {
    setupLoaded();
    mockUseDonationsNFTByRound.mockReturnValue({
      data: [{ RecordId: 1 }, { RecordId: 2 }],
    });

    render(<CurrentRoundPage />);

    expect(mockUseDonationsNFTByRound).toHaveBeenCalledWith(42);
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-count', '2');
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-erc20-count', '0');
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-cycle', '42');
  });

  it('renders the attached showcase near the top when current-cycle ERC20 tokens exist', () => {
    setupLoaded();
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: [{ EvtLogId: 1, TokenAddr: '0xToken', AmountDonatedEth: 5 }],
    });

    render(<CurrentRoundPage />);

    expect(mockUseDonationsERC20ByRound).toHaveBeenCalledWith(42);
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-count', '0');
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-erc20-count', '1');
    expect(screen.getByTestId('attached-nft-showcase')).toHaveAttribute('data-cycle', '42');
  });

  it('does not render the attached NFT showcase when no current-cycle NFTs exist', () => {
    setupLoaded();
    mockUseDonationsNFTByRound.mockReturnValue({ data: [] });

    render(<CurrentRoundPage />);

    expect(screen.queryByTestId('attached-nft-showcase')).not.toBeInTheDocument();
  });

  it('still passes attached NFTs to detailed RoundInfoSection', () => {
    setupLoaded();
    mockUseDonationsNFTByRound.mockReturnValue({
      data: [{ RecordId: 1 }, { RecordId: 2 }, { RecordId: 3 }],
    });

    render(<CurrentRoundPage />);

    expect(screen.getByTestId('round-info-section')).toHaveAttribute('data-nfts', '3');
  });

  it('still passes attached ERC20 tokens to detailed RoundInfoSection', () => {
    setupLoaded();
    mockUseDonationsERC20ByRound.mockReturnValue({
      data: [
        { EvtLogId: 1, TokenAddr: '0xToken1', AmountDonatedEth: 5 },
        { EvtLogId: 2, TokenAddr: '0xToken2', AmountDonatedEth: 9 },
      ],
    });

    render(<CurrentRoundPage />);

    expect(screen.getByTestId('round-info-section')).toHaveAttribute('data-erc20', '2');
  });

  it('renders singular gesture text for 1 gesture', () => {
    setupLoaded({ CurNumBids: 1 });
    render(<CurrentRoundPage />);
    expect(screen.getByText(/currentCycle\.hero\.subtitle\(date=.+,count=1\)/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    setupLoaded();
    mockUseAllocationFinalize.mockReturnValue({
      allocationTime: (NOW_SEC + 3600) * 1000,
      activationTime: NOW_SEC - 60,
    });
    mockUseCurrentTime.mockReturnValue({ data: NOW_SEC });
    const { container } = render(<CurrentRoundPage />);
    await checkA11y(container);
  }, 15_000);
});
