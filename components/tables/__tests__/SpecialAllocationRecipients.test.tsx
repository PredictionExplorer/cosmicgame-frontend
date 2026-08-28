import '@testing-library/jest-dom';

import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';
import type { ChampionsState } from '@/hooks/useChampions';
import type { GestureInfo } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

const enduranceAddress = '0x1111111111111111111111111111111111111111';
const chronoAddress = '0x3333333333333333333333333333333333333333';
const lastCstAddress = '0x2222222222222222222222222222222222222222';

const baseChampions: ChampionsState = {
  isLoading: false,
  hasData: true,
  endurance: {
    address: enduranceAddress,
    duration: 3600,
    lockedDuration: 3000,
    isLive: true,
  },
  chrono: {
    address: chronoAddress,
    duration: 1800,
    lockedDuration: 1800,
    isLive: false,
    statusText: 'Record standing',
    sourceText: 'Snapshot only',
    hasLiveDetails: false,
  },
  chronoChallenge: {
    address: enduranceAddress,
    recordToBeat: 1800,
    isLive: false,
    isRecordHolder: false,
    hasDetails: false,
  },
  lastCst: {
    address: lastCstAddress,
  },
  latestGesture: {
    address: enduranceAddress,
    holdDuration: 3600,
    latestGestureTime: 1000,
    isCurrentEnduranceChampion: true,
    isExtendingEnduranceRecord: true,
    durationToBeat: 3001,
    secondsUntilEnduranceChampion: 0,
    progressToEnduranceChampion: 100,
  },
  raw: null,
  source: 'api-v1',
};

const mockUseChampions = jest.fn(() => baseChampions);
jest.mock('../../../hooks/useChampions', () => ({
  useChampions: () => mockUseChampions(),
}));

function makeLatestGesture(overrides: Partial<GestureInfo> = {}): GestureInfo {
  return {
    EvtLogId: 101,
    BidPosition: 7,
    BlockNum: 1,
    TxId: 1,
    TxHash: '0xgesture',
    TimeStamp: 1_701_346_718,
    DateTime: '',
    RoundNum: 5,
    BidderAddr: enduranceAddress,
    GestureType: 0,
    GestureCostEth: 0.123456789,
    ParticipationCST: 100,
    ...overrides,
  };
}

describe('SpecialAllocationRecipients', () => {
  beforeEach(() => {
    mockUseChampions.mockReturnValue(baseChampions);
  });

  it('renders section heading', () => {
    render(<SpecialAllocationRecipients />);
    expect(screen.getByTestId('special-allocation-heading')).toHaveTextContent(
      'tables.specialAllocation.heading',
    );
  });

  it('renders all four allocation category labels', () => {
    render(<SpecialAllocationRecipients />);
    expect(screen.getByText('tables.specialAllocation.latestParticipant')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.enduranceChampion')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.chronoWarrior')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.finalCstGesture')).toBeInTheDocument();
  });

  it('renders all recipient addresses as links', () => {
    render(<SpecialAllocationRecipients />);
    const links = screen.getAllByRole('link');

    expect(links.some((l) => l.getAttribute('href') === `/user/${enduranceAddress}`)).toBe(true);
    expect(links.some((l) => l.getAttribute('href') === `/user/${chronoAddress}`)).toBe(true);
    expect(links.some((l) => l.getAttribute('href') === `/user/${lastCstAddress}`)).toBe(true);
  });

  it('renders the Latest Participant card with current hold and extending state', () => {
    render(
      <SpecialAllocationRecipients
        currentAccount={enduranceAddress}
        latestMessage="Signal received"
        latestGesture={makeLatestGesture({ Message: 'Signal received' })}
      />,
    );

    const latestCard = screen.getByTestId('special-allocation-card-latest-participant');
    expect(latestCard).toHaveTextContent(enduranceAddress);
    expect(latestCard).toHaveTextContent('tables.status.youBadge');
    expect(latestCard).toHaveTextContent('tables.specialAllocation.currentHold');
    expect(latestCard).toHaveTextContent('1h');
    expect(latestCard).toHaveTextContent('tables.specialAllocation.extendingRecord');
    expect(screen.getByTestId('latest-participant-message')).toHaveTextContent('Signal received');
  });

  it('shows ETH payment details for the latest participant gesture', () => {
    render(<SpecialAllocationRecipients latestGesture={makeLatestGesture()} />);

    const details = screen.getByTestId('latest-participant-gesture-details');
    expect(details).toHaveTextContent('tables.specialAllocation.lastGesture');
    expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent('0.1234568 ETH');
    expect(details).toHaveTextContent('tables.specialAllocation.method');
    expect(details).toHaveTextContent('ETH');
    expect(screen.getByTestId('latest-participant-random-walk')).toHaveTextContent(
      'tables.status.no',
    );
    expect(screen.getByTestId('latest-participant-gesture-id')).toHaveTextContent('#7');
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('100.00 CST');
    expect(screen.queryByTestId('latest-participant-attached-assets')).not.toBeInTheDocument();
    expect(details).not.toHaveTextContent('tables.specialAllocation.attachedAssets');
    expect(details).not.toHaveTextContent('tables.status.none');
  });

  it('shows CST payment details for the latest participant gesture', () => {
    render(
      <SpecialAllocationRecipients
        latestGesture={makeLatestGesture({
          GestureType: 2,
          GestureCostEth: 0,
          CstPriceEth: 25.5,
        })}
      />,
    );

    const details = screen.getByTestId('latest-participant-gesture-details');
    expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent('25.5000 CST');
    expect(details).toHaveTextContent('CST');
    expect(screen.getByTestId('latest-participant-random-walk')).toHaveTextContent(
      'tables.status.no',
    );
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('100.00 CST');
  });

  it('shows Participation CST received from the canonical latest gesture field', () => {
    render(
      <SpecialAllocationRecipients
        latestGesture={makeLatestGesture({
          ParticipationCST: 123.45,
          CSTRewardEth: 100,
          ERC20RewardAmountEth: 100,
        })}
      />,
    );

    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('123.45 CST');
  });

  it('falls back to legacy CST received fields for older latest gesture payloads', () => {
    render(
      <SpecialAllocationRecipients
        latestGesture={makeLatestGesture({
          ParticipationCST: undefined,
          CSTRewardEth: undefined,
          ERC20RewardAmountEth: 88,
        })}
      />,
    );

    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('88.00 CST');
  });

  it('shows unavailable CST received copy when the latest gesture omits reward fields', () => {
    render(
      <SpecialAllocationRecipients
        latestGesture={makeLatestGesture({
          ParticipationCST: undefined,
          CSTRewardEth: undefined,
          ERC20RewardAmountEth: undefined,
        })}
      />,
    );

    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent(
      'tables.status.unavailable',
    );
  });

  it('shows Random Walk token involvement and attached assets for the latest participant gesture', () => {
    render(
      <SpecialAllocationRecipients
        latestGesture={makeLatestGesture({
          GestureType: 1,
          GestureCostEth: 0.05,
          EthPriceEth: 0.05,
          RWalkNFTId: 123,
          NFTDonationTokenAddr: '0xNFT',
          NFTDonationTokenId: 7,
          DonatedERC20TokenAddr: '0xERC20',
        })}
      />,
    );

    const details = screen.getByTestId('latest-participant-gesture-details');
    expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent('0.0500000 ETH');
    expect(details).toHaveTextContent('Random Walk');
    expect(screen.getByTestId('latest-participant-random-walk')).toHaveTextContent(
      'tables.specialAllocation.yesToken',
    );
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('100.00 CST');
    expect(screen.getByTestId('latest-participant-attached-assets')).toHaveTextContent(
      'tables.specialAllocation.attachedAssets',
    );
    expect(details).toHaveTextContent('NFT + ERC20');
  });

  it('hides attached assets for sentinel NFT attachment IDs without a token attachment', () => {
    render(
      <SpecialAllocationRecipients
        latestGesture={makeLatestGesture({
          NFTDonationTokenAddr: '0xNFT',
          NFTDonationTokenId: -1,
          DonatedERC20TokenAddr: undefined,
        })}
      />,
    );

    const details = screen.getByTestId('latest-participant-gesture-details');
    expect(screen.queryByTestId('latest-participant-attached-assets')).not.toBeInTheDocument();
    expect(details).not.toHaveTextContent('tables.specialAllocation.attachedAssets');
  });

  it('keeps Last Gesture details visible while recipient snapshots converge', () => {
    render(
      <SpecialAllocationRecipients
        latestGesture={makeLatestGesture({
          BidderAddr: '0x4444444444444444444444444444444444444444',
        })}
      />,
    );

    expect(screen.getByTestId('latest-participant-gesture-details')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: '0x4444444444444444444444444444444444444444',
      }),
    ).toHaveAttribute('href', '/user/0x4444444444444444444444444444444444444444');
  });

  it('shows a syncing Last Gesture panel when dashboard identity arrives first', () => {
    render(
      <SpecialAllocationRecipients
        latestParticipantAddress="0x4444444444444444444444444444444444444444"
        showLastGesture
      />,
    );

    expect(screen.getByTestId('latest-participant-gesture-details')).toBeInTheDocument();
    expect(screen.getByTestId('latest-participant-gesture-syncing')).toHaveTextContent(
      'tables.specialAllocation.gestureDetailsSyncing',
    );
  });

  it('shows remaining time and accessible progress when a different latest participant is still challenging', () => {
    const latestAddress = '0x4444444444444444444444444444444444444444';
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: {
        ...baseChampions.endurance,
        isLive: false,
        duration: 100,
      },
      latestGesture: {
        address: latestAddress,
        holdDuration: 60,
        latestGestureTime: 1040,
        isCurrentEnduranceChampion: false,
        isExtendingEnduranceRecord: false,
        durationToBeat: 101,
        secondsUntilEnduranceChampion: 41,
        progressToEnduranceChampion: 59.4,
      },
    });

    render(<SpecialAllocationRecipients />);

    const latestCard = screen.getByTestId('special-allocation-card-latest-participant');
    expect(latestCard).toHaveTextContent(latestAddress);
    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'tables.specialAllocation.needsToBecomeChampion',
    );

    const progress = screen.getByRole('progressbar', {
      name: 'tables.specialAllocation.progressAria',
    });
    expect(progress).toHaveAttribute('aria-valuenow', '59');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows a progress bar without live-growing the endurance card when the same participant is under threshold', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: {
        ...baseChampions.endurance,
        isLive: false,
        duration: 500,
      },
      latestGesture: {
        ...baseChampions.latestGesture,
        holdDuration: 200,
        isCurrentEnduranceChampion: true,
        isExtendingEnduranceRecord: false,
        durationToBeat: 501,
        secondsUntilEnduranceChampion: 301,
        progressToEnduranceChampion: 39.9,
      },
    });

    render(<SpecialAllocationRecipients />);

    const enduranceCard = screen.getByTestId('special-allocation-card-endurance-champion');
    expect(enduranceCard).not.toHaveTextContent('tables.specialAllocation.liveGrowing');
    expect(enduranceCard).toHaveTextContent('tables.specialAllocation.recordStanding');

    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'tables.specialAllocation.needsToExtend',
    );
    expect(
      screen.getByRole('progressbar', { name: 'tables.specialAllocation.progressAria' }),
    ).toHaveAttribute('aria-valuenow', '39');
  });

  it('uses the Chrono-Warrior address rather than the Endurance Champion address', () => {
    render(<SpecialAllocationRecipients />);

    const chronoCard = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chronoCard).toHaveTextContent(chronoAddress);
    expect(chronoCard).not.toHaveTextContent(enduranceAddress);
  });

  it('shows live and locked status chips for timed roles', () => {
    render(<SpecialAllocationRecipients />);

    expect(screen.getAllByTestId('champion-live-chip').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('champion-locked-chip')).toHaveTextContent(
      'tables.specialAllocation.recordStanding',
    );
  });

  it('renders distinct duration labels and formatted durations for both timed roles', () => {
    render(<SpecialAllocationRecipients />);

    const enduranceCard = screen.getByTestId('special-allocation-card-endurance-champion');
    expect(enduranceCard).toHaveTextContent('tables.specialAllocation.enduranceWindow');
    expect(enduranceCard).toHaveTextContent('1h');

    const chronoCard = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chronoCard).toHaveTextContent('tables.specialAllocation.championReign');
    expect(chronoCard).toHaveTextContent('30m');
  });

  it('shows confirmed chrono details without exposing data source', () => {
    render(<SpecialAllocationRecipients />);

    const chronoCard = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chronoCard).not.toHaveTextContent('Snapshot only');
    expect(chronoCard).not.toHaveTextContent('Source');
    expect(chronoCard).toHaveTextContent('tables.specialAllocation.standingChronoRecord');
    expect(chronoCard).toHaveTextContent('tables.specialAllocation.chronoReign');
    expect(chronoCard).not.toHaveTextContent('tables.specialAllocation.liveGrowing');
    expect(screen.queryByTestId('chrono-active-challenge')).not.toBeInTheDocument();
  });

  it('shows source-backed chrono growth details', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      chrono: {
        ...baseChampions.chrono,
        isLive: true,
        statusText: 'Growing now',
        sourceText: 'Chain verified',
        hasLiveDetails: true,
        currentSegmentDuration: 1900,
        willStopGrowingIn: 300,
      },
      chronoChallenge: {
        address: chronoAddress,
        duration: 1900,
        recordToBeat: 1800,
        isLive: true,
        isRecordHolder: true,
        hasDetails: true,
        willStopGrowingIn: 300,
      },
      source: 'api-v1+chain',
    });

    render(<SpecialAllocationRecipients />);

    const chronoCard = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chronoCard).toHaveTextContent('tables.specialAllocation.growingNow');
    expect(chronoCard).not.toHaveTextContent('Chain verified');
    expect(screen.getByTestId('chrono-current-segment')).toHaveTextContent('31m 40s');
    expect(screen.getByTestId('chrono-current-segment')).toHaveTextContent(
      'tables.specialAllocation.recordGrowingSegment',
    );
    expect(screen.getByTestId('chrono-next-change')).toHaveTextContent(
      'tables.specialAllocation.mayCloseIn',
    );
    expect(screen.getByTestId('chrono-next-change')).toHaveTextContent('5m');
    expect(screen.queryByTestId('chrono-active-challenge')).not.toBeInTheDocument();
  });

  it('shows active Endurance challenge countdown outside the standing Chrono record', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      chrono: {
        ...baseChampions.chrono,
        statusText: 'Record standing',
        sourceText: 'API confirmed',
        hasLiveDetails: false,
      },
      chronoChallenge: {
        address: enduranceAddress,
        duration: 1200,
        recordToBeat: 1800,
        isLive: false,
        isRecordHolder: false,
        hasDetails: true,
        startsGrowingIn: 601,
      },
      source: 'api-v2',
    });

    render(<SpecialAllocationRecipients />);

    expect(screen.queryByTestId('chrono-source-status')).not.toBeInTheDocument();
    expect(screen.getByTestId('chrono-next-change')).toHaveTextContent(
      'tables.specialAllocation.recordStatus',
    );
    expect(screen.getByTestId('chrono-next-change')).not.toHaveTextContent('Starts growing in');
    expect(screen.getByTestId('chrono-active-challenge')).toHaveTextContent(
      'tables.specialAllocation.activeEnduranceChallenge',
    );
    expect(screen.getByTestId('chrono-active-challenge')).toHaveTextContent(enduranceAddress);
    expect(screen.getByTestId('chrono-challenge-segment')).toHaveTextContent('20m');
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent(
      'tables.specialAllocation.canOvertakeIn',
    );
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent('10m 1s');
    expect(screen.getByTestId('chrono-active-challenge')).toHaveTextContent(
      'tables.specialAllocation.challengeDescription',
    );
  });

  it('keeps the active Endurance challenge panel accessible', async () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      chrono: {
        ...baseChampions.chrono,
        hasLiveDetails: false,
      },
      chronoChallenge: {
        address: enduranceAddress,
        duration: 1200,
        recordToBeat: 1800,
        isLive: false,
        isRecordHolder: false,
        hasDetails: true,
        startsGrowingIn: 601,
      },
      source: 'api-v2',
    });

    const { container } = render(<SpecialAllocationRecipients />);

    expect(screen.getByTestId('chrono-active-challenge')).toHaveTextContent(
      'tables.specialAllocation.activeEnduranceChallenge',
    );
    await checkA11y(container);
  });

  it('does not render a live or locked timer badge on the Final CST card', () => {
    render(<SpecialAllocationRecipients />);

    const cstCard = screen.getByTestId('special-allocation-card-final-cst-gesture');
    expect(cstCard).not.toHaveTextContent('tables.specialAllocation.liveGrowing');
    expect(cstCard).not.toHaveTextContent('tables.specialAllocation.recordStanding');
  });

  it('renders empty role copy when addresses are unavailable', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      hasData: true,
      latestGesture: {
        ...baseChampions.latestGesture,
        address: null,
        holdDuration: 0,
        latestGestureTime: null,
        isCurrentEnduranceChampion: false,
        isExtendingEnduranceRecord: false,
        durationToBeat: 0,
        secondsUntilEnduranceChampion: 0,
        progressToEnduranceChampion: 0,
      },
      endurance: { ...baseChampions.endurance, address: null, duration: 0, isLive: false },
      chrono: { ...baseChampions.chrono, address: null, duration: 0, isLive: false },
      chronoChallenge: {
        ...baseChampions.chronoChallenge,
        address: null,
        duration: undefined,
        hasDetails: false,
      },
      lastCst: { address: null },
    });

    render(<SpecialAllocationRecipients />);

    expect(screen.getByText('tables.specialAllocation.noLatestGesture')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.noEnduranceRecord')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.noChronoRecord')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.awaitingCstGesture')).toBeInTheDocument();
  });

  it('shows first-record copy when latest participant exists before an endurance record', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: { ...baseChampions.endurance, address: null, duration: 0, isLive: false },
      latestGesture: {
        ...baseChampions.latestGesture,
        isCurrentEnduranceChampion: false,
        isExtendingEnduranceRecord: false,
        durationToBeat: 0,
        secondsUntilEnduranceChampion: 0,
        progressToEnduranceChampion: 0,
      },
    });

    render(<SpecialAllocationRecipients />);

    expect(screen.getByText('tables.specialAllocation.firstRecordForming')).toBeInTheDocument();
  });

  it('renders loading cards when the champions query is loading', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      isLoading: true,
      hasData: false,
    });

    const { container } = render(<SpecialAllocationRecipients />);
    expect(container.querySelectorAll('[data-special-allocation-card]')).toHaveLength(4);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SpecialAllocationRecipients />);
    await checkA11y(container);
  });
});
