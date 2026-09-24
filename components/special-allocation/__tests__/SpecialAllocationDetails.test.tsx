import type { ChampionsState } from '@/hooks/useChampions';

import { checkA11y, render, screen, within } from '@/test-utils';

import { ChronoWarriorDetails } from '../ChronoWarriorDetails';
import { DetailMetric } from '../DetailMetric';
import { LatestParticipantDetails } from '../LatestParticipantDetails';

const CHALLENGER = '0x1111111111111111111111111111111111111111';

const chrono: ChampionsState['chrono'] = {
  address: '0x2222222222222222222222222222222222222222',
  duration: 1800,
  lockedDuration: 1800,
  isLive: true,
  currentSegmentDuration: 1900,
  willStopGrowingIn: 300,
  statusText: 'Growing now',
  sourceText: 'API confirmed',
  hasLiveDetails: true,
};

const challenge: ChampionsState['chronoChallenge'] = {
  address: CHALLENGER,
  duration: 1200,
  recordToBeat: 1800,
  isLive: false,
  isRecordHolder: false,
  hasDetails: true,
  startsGrowingIn: 601,
};

const latest: ChampionsState['latestGesture'] = {
  address: '0x4444444444444444444444444444444444444444',
  holdDuration: 100,
  latestGestureTime: 1_700_000_000,
  isCurrentEnduranceChampion: false,
  isExtendingEnduranceRecord: false,
  durationToBeat: 3601,
  secondsUntilEnduranceChampion: 3501,
  progressToEnduranceChampion: 2.7,
};

describe('DetailMetric', () => {
  it('keeps the label static and colours only a live value', () => {
    render(
      <>
        <DetailMetric testId="still" label="Record to beat" value="30m" />
        <DetailMetric testId="ticking" label="Growing segment" value="31m 40s" tone="live" />
      </>,
    );
    const still = screen.getByTestId('still');
    expect(within(still).getByText('Record to beat')).toHaveClass('text-subtle');
    expect(within(still).getByText('30m')).toHaveClass('text-foreground');
    expect(within(screen.getByTestId('ticking')).getByText('31m 40s')).toHaveClass('text-live');
  });

  it('is a sunken well when framed, never a bordered box', () => {
    render(<DetailMetric testId="framed" label="Method" value="ETH" />);
    const framed = screen.getByTestId('framed');
    expect(framed).toHaveClass('bg-surface-sunken');
    expect(framed.className).not.toMatch(/\bborder\b/);
  });
});

describe('ChronoWarriorDetails', () => {
  it('shows the growing record and the separate active challenge, grouped by a hairline', () => {
    render(<ChronoWarriorDetails chrono={chrono} challenge={{ ...challenge, isLive: false }} />);
    const details = screen.getByTestId('chrono-warrior-details');
    expect(details).toHaveClass('border-t', 'border-rule-faint');
    expect(screen.getByTestId('chrono-current-segment')).toHaveTextContent('31m 40s');
    expect(within(screen.getByTestId('chrono-current-segment')).getByText('31m 40s')).toHaveClass(
      'text-live',
    );
    const active = screen.getByTestId('chrono-active-challenge');
    expect(within(active).getByRole('link', { name: CHALLENGER })).toHaveAttribute(
      'href',
      `/user/${CHALLENGER}`,
    );
    expect(screen.getByTestId('chrono-challenge-record-to-beat')).toHaveTextContent('30m');
    expect(
      within(screen.getByTestId('chrono-challenge-record-to-beat')).getByText('30m'),
    ).toHaveClass('text-foreground');
    expect(screen.getByTestId('chrono-challenge-next-change')).toHaveTextContent('10m 1s');
  });

  it('renders nothing on the dashboard when no record is growing and no challenge is open', () => {
    const { container } = render(
      <ChronoWarriorDetails
        chrono={{ ...chrono, isLive: false }}
        challenge={{ ...challenge, hasDetails: false }}
        compact
        dashboard
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChronoWarriorDetails chrono={chrono} challenge={challenge} compact />,
    );
    await checkA11y(container);
  });
});

describe('LatestParticipantDetails', () => {
  it('draws progress toward the Endurance record in the accent and keeps amounts in ink', () => {
    render(
      <LatestParticipantDetails
        latest={latest}
        hasEnduranceRecord
        latestAddress={latest.address}
        latestGesture={null}
        showLastGesture
        gestureDetailsPending
      />,
    );
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '2');
    expect(progress.firstElementChild).toHaveClass('bg-primary');
    expect(screen.getByTestId('latest-participant-gesture-syncing')).toHaveAttribute(
      'role',
      'status',
    );
  });

  it('marks a forming first record with a live dot and words', async () => {
    const { container } = render(
      <LatestParticipantDetails
        latest={latest}
        hasEnduranceRecord={false}
        latestAddress={latest.address}
      />,
    );
    const status = screen.getByTestId('latest-participant-status');
    expect(status.querySelector('.bg-live')).not.toBeNull();
    expect(status).toHaveTextContent(/\S/);
    await checkA11y(container);
  });
});
