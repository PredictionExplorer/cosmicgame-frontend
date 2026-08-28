import type { ChampionsState } from '@/hooks/useChampions';

import { render, screen, within, checkA11y } from '@/test-utils';

import { ChronoEnduranceIntel } from '../ChronoEnduranceIntel';

const ENDURANCE = '0x1111111111111111111111111111111111111111';
const CHRONO = '0x2222222222222222222222222222222222222222';
const FINAL_CST = '0x3333333333333333333333333333333333333333';

const baseChampions: ChampionsState = {
  isLoading: false,
  hasData: true,
  endurance: {
    address: ENDURANCE,
    duration: 3600,
    lockedDuration: 3600,
    isLive: false,
  },
  chrono: {
    address: CHRONO,
    duration: 1800,
    lockedDuration: 1800,
    isLive: false,
    statusText: 'Record standing',
    sourceText: 'API confirmed',
    hasLiveDetails: false,
  },
  chronoChallenge: {
    address: ENDURANCE,
    duration: 1200,
    recordToBeat: 1800,
    isLive: false,
    isRecordHolder: false,
    hasDetails: true,
    startsGrowingIn: 601,
  },
  lastCst: { address: FINAL_CST },
  latestGesture: {
    address: '0x4444444444444444444444444444444444444444',
    holdDuration: 100,
    latestGestureTime: 1_700_000_000,
    isCurrentEnduranceChampion: false,
    isExtendingEnduranceRecord: false,
    durationToBeat: 3601,
    secondsUntilEnduranceChampion: 3501,
    progressToEnduranceChampion: 2.7,
  },
  raw: null,
  source: 'api-v2',
};

describe('ChronoEnduranceIntel', () => {
  it('shows Endurance, Chrono, and Final CST roles with distinct recipients and amounts', () => {
    render(<ChronoEnduranceIntel champions={baseChampions} chronoEth={0.8} />);

    const endurance = screen.getByTestId('control-desk-endurance');
    expect(within(endurance).getByRole('link', { name: ENDURANCE })).toHaveAttribute(
      'href',
      `/user/${ENDURANCE}`,
    );
    expect(endurance).toHaveTextContent('0x111111....111111');
    expect(endurance).toHaveTextContent('1h');
    expect(endurance).toHaveTextContent('home.observatory.standings.cstPlusNft');

    const chrono = screen.getByTestId('chrono-role-summary');
    expect(within(chrono).getByRole('link', { name: CHRONO })).toHaveAttribute(
      'href',
      `/user/${CHRONO}`,
    );
    expect(chrono).toHaveTextContent('30m');
    expect(chrono).toHaveTextContent('home.allocation.amounts.eth(amount=0.8000)');
    expect(chrono).not.toHaveTextContent(ENDURANCE);

    const finalCst = screen.getByTestId('final-cst-role-summary');
    expect(within(finalCst).getByRole('link', { name: FINAL_CST })).toHaveAttribute(
      'href',
      `/user/${FINAL_CST}`,
    );
  });

  it('shows the active Endurance challenge with segment, record, and overtake time', () => {
    render(<ChronoEnduranceIntel champions={baseChampions} chronoEth={0.8} />);

    const challenge = screen.getByTestId('chrono-active-challenge');
    expect(challenge).toHaveTextContent('tables.specialAllocation.activeEnduranceChallenge');
    expect(challenge).toHaveTextContent('0x111111....111111');
    expect(screen.getByTestId('chrono-challenge-segment')).toHaveTextContent('20m');
    expect(screen.getByTestId('chrono-challenge-record-to-beat')).toHaveTextContent('30m');
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent(
      'tables.specialAllocation.canOvertakeIn',
    );
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent('10m 1s');
  });

  it('shows a live-growing Chrono segment and when growth may close', () => {
    const liveChampions: ChampionsState = {
      ...baseChampions,
      chrono: {
        ...baseChampions.chrono,
        isLive: true,
        duration: 1900,
        currentSegmentDuration: 1900,
        willStopGrowingIn: 300,
        hasLiveDetails: true,
      },
      chronoChallenge: {
        address: CHRONO,
        duration: 1900,
        recordToBeat: 1800,
        isLive: true,
        isRecordHolder: true,
        hasDetails: true,
        willStopGrowingIn: 300,
      },
    };

    render(<ChronoEnduranceIntel champions={liveChampions} chronoEth={0.8} />);

    expect(screen.getByTestId('chrono-current-segment')).toHaveTextContent('31m 40s');
    expect(screen.getByTestId('chrono-next-change')).toHaveTextContent(
      'tables.specialAllocation.mayCloseIn',
    );
    expect(screen.getByTestId('chrono-next-change')).toHaveTextContent('5m');
    expect(screen.queryByTestId('chrono-active-challenge')).not.toBeInTheDocument();
  });

  it('uses extend language when the active challenger already owns the Chrono record', () => {
    const extendChampions: ChampionsState = {
      ...baseChampions,
      chronoChallenge: {
        ...baseChampions.chronoChallenge,
        address: CHRONO,
        isRecordHolder: true,
      },
    };

    render(<ChronoEnduranceIntel champions={extendChampions} chronoEth={0.8} />);

    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent(
      'tables.specialAllocation.canExtendIn',
    );
  });

  it('marks roles held by the connected participant', () => {
    render(
      <ChronoEnduranceIntel
        champions={baseChampions}
        chronoEth={0.8}
        account={ENDURANCE.toUpperCase()}
      />,
    );

    expect(
      within(screen.getByTestId('control-desk-endurance')).getByText('tables.status.youBadge'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('chrono-role-summary')).queryByText('tables.status.youBadge'),
    ).not.toBeInTheDocument();
  });

  it('does not expose internal API-versus-chain source labels', () => {
    render(<ChronoEnduranceIntel champions={baseChampions} chronoEth={0.8} />);
    expect(screen.queryByText('API confirmed')).not.toBeInTheDocument();
    expect(screen.queryByText('Chain verified')).not.toBeInTheDocument();
  });

  it('shows accurate empty states when no roles exist', () => {
    const empty: ChampionsState = {
      ...baseChampions,
      endurance: { ...baseChampions.endurance, address: null, duration: 0 },
      chrono: { ...baseChampions.chrono, address: null, duration: 0 },
      chronoChallenge: {
        ...baseChampions.chronoChallenge,
        address: null,
        duration: undefined,
        hasDetails: false,
      },
      lastCst: { address: null },
    };

    render(<ChronoEnduranceIntel champions={empty} chronoEth={0} />);

    expect(screen.getByText('tables.specialAllocation.noEnduranceRecord')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.noChronoRecord')).toBeInTheDocument();
    expect(screen.getByText('tables.specialAllocation.awaitingCstGesture')).toBeInTheDocument();
    expect(screen.queryByTestId('chrono-warrior-details')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChronoEnduranceIntel champions={baseChampions} chronoEth={0.8} />,
    );
    await checkA11y(container);
  });
});
