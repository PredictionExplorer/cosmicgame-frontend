// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import { BiddingActivitySection } from '../BiddingActivitySection';

const mockUseBidTimeBounds = jest.fn();
const mockUseBidFrequency = jest.fn();
const mockUseBiddingActivity = jest.fn();
const mockUseTopBidderActivePeriods = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useBidFrequency: (...args: unknown[]) => mockUseBidFrequency(...args),
  useBiddingActivity: (...args: unknown[]) => mockUseBiddingActivity(...args),
  useTopBidderActivePeriods: (...args: unknown[]) => mockUseTopBidderActivePeriods(...args),
}));

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => NOW_SEC * 1000,
}));

/** The child charts are rendered for real; only recharts itself is stubbed. */
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceArea: () => null,
}));

const HOUR = 3600;
const DAY = 86400;
const NOW_SEC = 1_700_000_000 - (1_700_000_000 % DAY);
const MIN_TS = NOW_SEC - 10 * DAY;
const PARTICIPANT = '0xAAAA000000000000000000000000000000001111';

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

function withData() {
  mockUseBidTimeBounds.mockReturnValue(okQuery({ MinTs: MIN_TS, MaxTs: NOW_SEC }));
  mockUseBidFrequency.mockReturnValue(
    okQuery([{ BucketTs: MIN_TS, NumBids: 12, UniqueBidders: 4 }]),
  );
  mockUseBiddingActivity.mockReturnValue(
    okQuery({
      Spikes: [
        {
          Index: 0,
          StartTs: MIN_TS,
          EndTs: MIN_TS + HOUR,
          PeakTs: MIN_TS,
          PeakNumBids: 12,
          TotalBids: 12,
          BucketCount: 1,
        },
      ],
      RecentSpikeIndex: 0,
    }),
  );
  mockUseTopBidderActivePeriods.mockReturnValue(
    okQuery({
      InitTs: MIN_TS,
      FinTs: NOW_SEC,
      TopN: 20,
      GapHours: 6,
      MinBids: 2,
      TopBidders: [{ BidderAid: 1, BidderAddr: PARTICIPANT, NumBids: 9 }],
      ActivePeriods: [
        {
          BidderAid: 1,
          BidderAddr: PARTICIPANT,
          PeriodStart: MIN_TS + DAY,
          PeriodEnd: MIN_TS + DAY + HOUR,
          NumBids: 5,
          DurationSecs: HOUR,
        },
      ],
    }),
  );
}

function withoutData() {
  mockUseBidTimeBounds.mockReturnValue(okQuery({ MinTs: 0, MaxTs: 0 }));
  mockUseBidFrequency.mockReturnValue(okQuery([]));
  mockUseBiddingActivity.mockReturnValue(okQuery({ Spikes: [], RecentSpikeIndex: -1 }));
  mockUseTopBidderActivePeriods.mockReturnValue(
    okQuery({
      InitTs: 0,
      FinTs: 0,
      TopN: 20,
      GapHours: 6,
      MinBids: 2,
      TopBidders: [],
      ActivePeriods: [],
    }),
  );
}

/** The section title also names its info tooltip, so disambiguate by role. */
function sectionToggle(name: RegExp): HTMLElement {
  const toggle = screen
    .getAllByRole('button', { name })
    .find((button) => button.hasAttribute('aria-expanded'));
  if (!toggle) throw new Error(`No collapsible section named ${name}`);
  return toggle;
}

function allSectionToggles(): HTMLElement[] {
  return screen.getAllByRole('button').filter((button) => button.hasAttribute('aria-expanded'));
}

beforeEach(() => {
  jest.clearAllMocks();
  withData();
});

describe('BiddingActivitySection', () => {
  it('groups the three activity charts under one heading', () => {
    render(<BiddingActivitySection />);

    expect(screen.getByText('Gesture Activity')).toBeInTheDocument();
    expect(sectionToggle(/Gesture Frequency Over Time/)).toBeInTheDocument();
    expect(sectionToggle(/Gesture Spikes/)).toBeInTheDocument();
    expect(sectionToggle(/Top 20 Participant Active Periods/)).toBeInTheDocument();
  });

  it('opens every section on first render', () => {
    render(<BiddingActivitySection />);

    const toggles = allSectionToggles();

    expect(toggles).toHaveLength(3);
    for (const toggle of toggles) {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    }
  });

  it('mounts each chart with its data', () => {
    render(<BiddingActivitySection />);

    expect(screen.getByTestId('bid-frequency-chart')).toBeInTheDocument();
    expect(screen.getByText(/viewing spike #1/i)).toBeInTheDocument();
    expect(screen.getByTestId('bidder-active-periods-timeline')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '0xAAAA....1111' })).toBeInTheDocument();
  });

  it('collapses a section without unmounting the others', async () => {
    const user = userEvent.setup();
    render(<BiddingActivitySection />);

    await user.click(sectionToggle(/Gesture Frequency Over Time/));

    expect(sectionToggle(/Gesture Frequency Over Time/)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('bidder-active-periods-timeline')).toBeInTheDocument();
  });

  it('offers an explanation beside every section title', () => {
    render(<BiddingActivitySection />);

    expect(
      screen.getByRole('button', { name: 'More information about Gesture Spikes' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^More information about/ })).toHaveLength(3);
  });

  it('shows each chart empty state when nothing has been indexed', () => {
    withoutData();
    render(<BiddingActivitySection />);

    expect(screen.getByText('No gesture activity in this time range.')).toBeInTheDocument();
    expect(screen.getByText('No gesture spikes detected in indexed history.')).toBeInTheDocument();
    expect(
      screen.getByText('No active gesture periods found for top participants.'),
    ).toBeInTheDocument();
  });

  it('keeps all three sections present when empty', () => {
    withoutData();
    render(<BiddingActivitySection />);

    expect(allSectionToggles()).toHaveLength(3);
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<BiddingActivitySection />);

    await checkA11y(container);
  });

  it('has no accessibility violations when empty', async () => {
    withoutData();
    const { container } = render(<BiddingActivitySection />);

    await checkA11y(container);
  });
});
// lexicon-allow-end
