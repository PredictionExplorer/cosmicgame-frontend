import '@testing-library/jest-dom';

import type { ChampionsState } from '@/hooks/useChampions';
import type { GestureInfo } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import { CycleStandings } from '../components/CycleStandings';

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
jest.mock('../../../../../hooks/useChampions', () => ({
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

function renderStandings(props: Partial<Parameters<typeof CycleStandings>[0]> = {}) {
  return render(<CycleStandings headingId="standings" {...props} />);
}

describe('CycleStandings', () => {
  beforeEach(() => {
    mockUseChampions.mockReturnValue(baseChampions);
  });

  it('is a section labelled by its heading', () => {
    renderStandings();
    expect(screen.getByRole('region', { name: 'currentCycle.standings.title' })).toHaveAttribute(
      'data-special-allocation-leaders',
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'currentCycle.standings.title',
    );
    // The help is visible under the heading, not hidden behind an icon.
    expect(screen.getByText('tables.specialAllocation.headingHelp')).toBeVisible();
  });

  it('names the four roles as headings, three of them glossary terms', () => {
    renderStandings();
    const roles = screen.getAllByRole('heading', { level: 4 });
    expect(roles).toHaveLength(4);
    expect(roles[0]).toHaveTextContent('currentCycle.standings.latest');
    expect(roles[1]!.querySelector('[data-term="enduranceChampion"]')).not.toBeNull();
    expect(roles[2]!.querySelector('[data-term="chronoWarrior"]')).not.toBeNull();
    expect(roles[3]!.querySelector('[data-term="finalCstGesture"]')).not.toBeNull();
  });

  it('links every holder to their participant page', () => {
    renderStandings();
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain(`/user/${enduranceAddress}`);
    expect(hrefs).toContain(`/user/${chronoAddress}`);
    expect(hrefs).toContain(`/user/${lastCstAddress}`);
  });

  it('shows the latest hold as a growing figure and says the holder is extending the record', () => {
    renderStandings({ latestGesture: makeLatestGesture({ Message: 'Signal received' }) });

    const latest = screen.getByTestId('special-allocation-card-latest-participant');
    expect(latest).toHaveTextContent(enduranceAddress);
    expect(latest).toHaveTextContent('tables.specialAllocation.currentHold');
    expect(within(latest).getByTestId('champion-live-chip')).toHaveTextContent(
      'tables.specialAllocation.growingNow',
    );
    expect(latest.querySelector('time.text-positive')).toHaveTextContent('1h');
    // A bar measured against the holder's own record would read "100% · 1h of 1h".
    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'tables.specialAllocation.extendingRecord',
    );
    expect(latest.querySelector('[role="progressbar"]')).toBeNull();
    expect(latest).not.toHaveTextContent('tables.specialAllocation.progressAmounts');
    expect(screen.getByTestId('latest-participant-message')).toHaveTextContent('Signal received');
  });

  it('shows what the last gesture paid and imprinted, and links to its record', () => {
    renderStandings({ latestGesture: makeLatestGesture() });

    const details = screen.getByTestId('latest-participant-gesture-details');
    expect(details).toHaveTextContent('currentCycle.standings.lastGesture');
    expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent(/0\.12\d* ETH/);
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('100 CST');
    expect(details.querySelector('.bg-method-eth')).not.toBeNull();
    expect(screen.getByTestId('latest-participant-gesture-id')).toHaveAttribute(
      'href',
      '/gesture/101',
    );
    expect(screen.getByTestId('latest-participant-gesture-id')).toHaveTextContent(
      'currentCycle.standings.gestureLink(position=7)',
    );
    expect(screen.queryByTestId('latest-participant-random-walk')).not.toBeInTheDocument();
    expect(screen.queryByTestId('latest-participant-attached-assets')).not.toBeInTheDocument();
    expect(screen.queryByTestId('latest-participant-message')).not.toBeInTheDocument();
  });

  it('quotes a CST gesture in CST', () => {
    renderStandings({
      latestGesture: makeLatestGesture({ GestureType: 2, GestureCostEth: 0, CstPriceEth: 25.5 }),
    });

    expect(screen.getByTestId('latest-participant-paid-amount')).toHaveTextContent('25.5 CST');
    expect(
      screen.getByTestId('latest-participant-gesture-details').querySelector('.bg-method-cst'),
    ).not.toBeNull();
  });

  it('reads Participation CST from the canonical field, then the legacy ones', () => {
    const { unmount } = renderStandings({
      latestGesture: makeLatestGesture({
        ParticipationCST: 123.45,
        CSTRewardEth: 100,
        ERC20RewardAmountEth: 100,
      }),
    });
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('123.45 CST');
    unmount();

    renderStandings({
      latestGesture: makeLatestGesture({
        ParticipationCST: undefined,
        CSTRewardEth: undefined,
        ERC20RewardAmountEth: 88,
      }),
    });
    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent('88 CST');
  });

  it('shows an unknown value when the gesture carries no reward field', () => {
    renderStandings({
      latestGesture: makeLatestGesture({
        ParticipationCST: undefined,
        CSTRewardEth: undefined,
        ERC20RewardAmountEth: undefined,
      }),
    });

    expect(screen.getByTestId('latest-participant-cst-received')).toHaveTextContent(
      'common.status.unavailable',
    );
  });

  it('shows the Random Walk token and attached assets of the last gesture', () => {
    renderStandings({
      latestGesture: makeLatestGesture({
        GestureType: 1,
        GestureCostEth: 0.05,
        EthPriceEth: 0.05,
        RWalkNFTId: 123,
        NFTDonationTokenAddr: '0xNFT',
        NFTDonationTokenId: 7,
        DonatedERC20TokenAddr: '0xERC20',
      }),
    });

    expect(screen.getByText('ETH + RWLK')).toBeInTheDocument();
    expect(screen.getByTestId('latest-participant-random-walk')).toHaveTextContent('#123');
    expect(screen.getByTestId('latest-participant-attached-assets')).toHaveTextContent(
      'NFT + ERC20',
    );
  });

  it('hides attached assets for a sentinel NFT id without a token', () => {
    renderStandings({
      latestGesture: makeLatestGesture({
        NFTDonationTokenAddr: '0xNFT',
        NFTDonationTokenId: -1,
        DonatedERC20TokenAddr: undefined,
      }),
    });

    expect(screen.queryByTestId('latest-participant-attached-assets')).not.toBeInTheDocument();
  });

  it('names who made the last gesture while the holder snapshot converges', () => {
    const other = '0x4444444444444444444444444444444444444444';
    renderStandings({ latestGesture: makeLatestGesture({ BidderAddr: other }) });

    const details = screen.getByTestId('latest-participant-gesture-details');
    expect(details).toHaveTextContent('tables.specialAllocation.gestureBy');
    expect(within(details).getByRole('link', { name: other })).toHaveAttribute(
      'href',
      `/user/${other}`,
    );
  });

  it('says the last gesture is syncing when only the dashboard knows the holder', () => {
    renderStandings({
      latestParticipantAddress: '0x4444444444444444444444444444444444444444',
    });

    expect(screen.getByTestId('latest-participant-gesture-syncing')).toHaveTextContent(
      'tables.specialAllocation.gestureDetailsSyncing',
    );
  });

  it('measures a challenger against the record with an accessible progress rule', () => {
    const latestAddress = '0x4444444444444444444444444444444444444444';
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: { ...baseChampions.endurance, isLive: false, duration: 100 },
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

    renderStandings();

    expect(screen.getByTestId('special-allocation-card-latest-participant')).toHaveTextContent(
      latestAddress,
    );
    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'tables.specialAllocation.needsToBecomeChampion(duration=41s)',
    );
    const progress = screen.getByRole('progressbar', {
      name: 'tables.specialAllocation.progressAria',
    });
    expect(progress).toHaveAttribute('aria-valuenow', '59');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('59%')).toBeInTheDocument();
  });

  it('asks the champion to extend when their own hold is under the record', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
      endurance: { ...baseChampions.endurance, isLive: false, duration: 500 },
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

    renderStandings();

    const endurance = screen.getByTestId('special-allocation-card-endurance-champion');
    expect(within(endurance).queryByTestId('champion-live-chip')).not.toBeInTheDocument();
    expect(within(endurance).getByTestId('champion-locked-chip')).toHaveTextContent(
      'tables.specialAllocation.recordStanding',
    );
    expect(screen.getByTestId('latest-participant-remaining')).toHaveTextContent(
      'tables.specialAllocation.needsToExtend',
    );
    expect(
      screen.getByRole('progressbar', { name: 'tables.specialAllocation.progressAria' }),
    ).toHaveAttribute('aria-valuenow', '39');
  });

  it('says the first record is forming before any Endurance Champion exists', () => {
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

    renderStandings();

    expect(screen.getByTestId('latest-participant-status')).toHaveTextContent(
      'tables.specialAllocation.firstRecordForming',
    );
  });

  it('keeps the Chrono-Warrior apart from the Endurance Champion', () => {
    renderStandings();

    const chrono = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chrono).toHaveTextContent(chronoAddress);
    expect(chrono).not.toHaveTextContent(enduranceAddress);
    expect(chrono).toHaveTextContent('tables.specialAllocation.championReign');
    expect(chrono).toHaveTextContent('30m');
    expect(chrono).not.toHaveTextContent('Snapshot only');
    expect(within(chrono).getByTestId('champion-locked-chip')).toBeInTheDocument();
    expect(screen.queryByTestId('chrono-active-challenge')).not.toBeInTheDocument();
  });

  it('shows the growing Chrono segment and when it may close', () => {
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

    renderStandings();

    const chrono = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(within(chrono).getByTestId('champion-live-chip')).toBeInTheDocument();
    expect(chrono).not.toHaveTextContent('Chain verified');
    expect(screen.getByTestId('chrono-current-segment')).toHaveTextContent('31m 40s');
    expect(screen.getByTestId('chrono-next-change')).toHaveTextContent(
      'tables.specialAllocation.mayCloseValue(duration=5m)',
    );
    expect(screen.queryByTestId('chrono-active-challenge')).not.toBeInTheDocument();
  });

  it('shows an active endurance challenge under a standing Chrono record', async () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
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

    const { container } = renderStandings();

    const challenge = screen.getByTestId('chrono-active-challenge');
    expect(challenge).toHaveTextContent('currentCycle.standings.activeChallenge');
    expect(challenge).toHaveTextContent(enduranceAddress);
    expect(screen.getByTestId('chrono-challenge-segment')).toHaveTextContent('20m');
    expect(screen.getByTestId('chrono-challenge-record-to-beat')).toHaveTextContent('30m');
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent(
      'tables.specialAllocation.canOvertakeIn',
    );
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent('10m 1s');
    expect(challenge).toHaveTextContent('tables.specialAllocation.challengeDescription');
    await checkA11y(container);
  });

  it('gives the Final CST Gesture no timer badge', () => {
    renderStandings();

    const cst = screen.getByTestId('special-allocation-card-final-cst-gesture');
    expect(within(cst).queryByTestId('champion-live-chip')).not.toBeInTheDocument();
    expect(within(cst).queryByTestId('champion-locked-chip')).not.toBeInTheDocument();
    expect(cst).toHaveTextContent('tables.specialAllocation.finalCstNote');
  });

  it('renders each empty role as its empty line alone', () => {
    mockUseChampions.mockReturnValue({
      ...baseChampions,
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
      chrono: { ...baseChampions.chrono, address: null, duration: 0, isLive: true },
      chronoChallenge: {
        ...baseChampions.chronoChallenge,
        address: null,
        duration: undefined,
        hasDetails: false,
      },
      lastCst: { address: null },
    });

    renderStandings();

    expect(screen.getByText('tables.specialAllocation.noLatestGesture')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.noEnduranceRecord')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.noChronoRecord')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.awaitingCstGesture')).toBeInTheDocument();
    // No "0s" reign and no badge for a record that does not exist.
    const chrono = screen.getByTestId('special-allocation-card-chrono-warrior');
    expect(chrono).not.toHaveTextContent('tables.specialAllocation.championReign');
    expect(within(chrono).queryByTestId('champion-live-chip')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('draws skeleton rows while the champions load', () => {
    mockUseChampions.mockReturnValue({ ...baseChampions, isLoading: true, hasData: false });

    const { container } = renderStandings();
    expect(container.querySelectorAll('[data-special-allocation-card]')).toHaveLength(4);
    expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('draws no boxes inside the ledger', () => {
    const { container } = renderStandings({ latestGesture: makeLatestGesture() });
    const html = container.innerHTML;
    expect(html).not.toMatch(/bg-white\/|border-white\/|text-\[1[01]px\]|emerald|amber/);
    expect(container.querySelectorAll('li [class*="rounded-lg"]')).toHaveLength(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderStandings({ latestGesture: makeLatestGesture() });
    await checkA11y(container);
  });
});
