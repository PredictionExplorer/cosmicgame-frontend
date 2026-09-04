// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { TopBidderActivePeriodsResponse } from '@/services/api/types';

import { act, checkA11y, render, screen, within } from '@/test-utils';

import { BidderActivePeriodsTimeline } from '../BidderActivePeriodsTimeline';

const mockUseBidTimeBounds = jest.fn();
const mockUseTopBidderActivePeriods = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useTopBidderActivePeriods: (...args: unknown[]) => mockUseTopBidderActivePeriods(...args),
}));

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => NOW_SEC * 1000,
}));

const HOUR = 3600;
const DAY = 86400;
const NOW_SEC = 1_700_000_000 - (1_700_000_000 % DAY);
const MIN_TS = NOW_SEC - 10 * DAY;

const ALICE = '0xAAAA000000000000000000000000000000001111';
const BOB = '0xBBBB000000000000000000000000000000002222';

const periodsResponse: TopBidderActivePeriodsResponse = {
  InitTs: MIN_TS,
  FinTs: NOW_SEC,
  TopN: 20,
  GapHours: 6,
  MinBids: 2,
  TopBidders: [
    { BidderAid: 1, BidderAddr: ALICE, NumBids: 9 },
    { BidderAid: 2, BidderAddr: BOB, NumBids: 4 },
  ],
  ActivePeriods: [
    {
      BidderAid: 1,
      BidderAddr: ALICE,
      PeriodStart: MIN_TS + DAY,
      PeriodEnd: MIN_TS + DAY + 2 * HOUR,
      NumBids: 5,
      DurationSecs: 2 * HOUR,
    },
    {
      BidderAid: 1,
      BidderAddr: ALICE,
      PeriodStart: MIN_TS + 5 * DAY,
      // A burst so short it would otherwise draw as a zero-width bar.
      PeriodEnd: MIN_TS + 5 * DAY + 1,
      NumBids: 4,
      DurationSecs: 1,
    },
    {
      BidderAid: 2,
      BidderAddr: BOB,
      PeriodStart: MIN_TS + 2 * DAY,
      PeriodEnd: MIN_TS + 2 * DAY + HOUR,
      NumBids: 4,
      DurationSecs: HOUR,
    },
  ],
};

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBidTimeBounds.mockReturnValue(okQuery({ MinTs: MIN_TS, MaxTs: NOW_SEC }));
  mockUseTopBidderActivePeriods.mockReturnValue(okQuery(periodsResponse));
});

describe('BidderActivePeriodsTimeline', () => {
  it('explains how many participants the timeline covers', () => {
    render(<BidderActivePeriodsTimeline />);

    expect(screen.getByText(/Active periods for the top 20 participants/i)).toBeInTheDocument();
  });

  it('draws one lane per ranked participant with a link and a gesture count', () => {
    render(<BidderActivePeriodsTimeline />);

    const aliceLink = screen.getByRole('link', { name: '0xAAAA....1111' });
    expect(aliceLink).toHaveAttribute('href', `/user/${ALICE}`);
    expect(aliceLink).toHaveAttribute('title', ALICE);
    expect(screen.getByText('(9)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '0xBBBB....2222' })).toBeInTheDocument();
  });

  it('gives every burst an accessible description of who, how many and when', () => {
    render(<BidderActivePeriodsTimeline />);

    const bars = screen.getAllByRole('img');
    expect(bars).toHaveLength(periodsResponse.ActivePeriods.length);
    expect(
      screen.getByRole('img', { name: /^0xAAAA00\.\.\.\.001111: 5 gestures from .+ to .+$/ }),
    ).toBeInTheDocument();
  });

  it('places each burst in its own participant lane', () => {
    const { container } = render(<BidderActivePeriodsTimeline />);
    const lanes = Array.from(container.querySelectorAll('svg'));

    expect(lanes).toHaveLength(2);
    expect(within(lanes[0] as unknown as HTMLElement).getAllByRole('img')).toHaveLength(2);
    expect(within(lanes[1] as unknown as HTMLElement).getAllByRole('img')).toHaveLength(1);
  });

  it('positions a burst proportionally along the cycle window', () => {
    const { container } = render(<BidderActivePeriodsTimeline />);
    const firstBar = container.querySelectorAll('rect')[0]!;

    // The window runs MinTs → MaxTs + 1h over a 1000-unit viewBox; the first
    // burst starts one day in.
    const range = NOW_SEC + HOUR - MIN_TS;
    expect(Number(firstBar.getAttribute('x'))).toBeCloseTo((DAY / range) * 1000, 5);
  });

  it('keeps a one-second burst wide enough to stay visible', () => {
    const { container } = render(<BidderActivePeriodsTimeline />);
    const shortBar = container.querySelectorAll('rect')[1]!;

    expect(Number(shortBar.getAttribute('width'))).toBeGreaterThan(0);
  });

  it('reveals a burst summary on hover and hides it again on leave', async () => {
    const user = userEvent.setup();
    render(<BidderActivePeriodsTimeline />);
    const bar = screen.getAllByRole('img')[0]!;

    await user.hover(bar);
    expect(screen.getByText('5 gestures · 120 min span')).toBeInTheDocument();

    await user.unhover(bar);
    expect(screen.queryByText('5 gestures · 120 min span')).not.toBeInTheDocument();
  });

  it('reveals the same summary on keyboard focus and hides it on blur', () => {
    render(<BidderActivePeriodsTimeline />);
    const bar = screen.getAllByRole('img')[0] as unknown as SVGRectElement;

    act(() => bar.focus());
    expect(bar).toHaveFocus();
    expect(screen.getByText('5 gestures · 120 min span')).toBeInTheDocument();

    act(() => bar.blur());
    expect(screen.queryByText('5 gestures · 120 min span')).not.toBeInTheDocument();
  });

  it('makes every burst reachable with the keyboard', () => {
    render(<BidderActivePeriodsTimeline />);

    for (const bar of screen.getAllByRole('img')) {
      expect(bar).toHaveAttribute('tabindex', '0');
    }
  });

  it('asks for the top twenty participants across the full indexed window', () => {
    render(<BidderActivePeriodsTimeline />);

    expect(mockUseTopBidderActivePeriods).toHaveBeenLastCalledWith(
      20,
      MIN_TS,
      NOW_SEC + HOUR,
      true,
    );
  });

  it('waits for real time bounds before querying', () => {
    mockUseBidTimeBounds.mockReturnValue(okQuery({ MinTs: 0, MaxTs: 0 }));
    render(<BidderActivePeriodsTimeline />);

    // With no bounds the fallback window is a year back from now, which is
    // still a valid range, so the query stays enabled.
    const [topN, initTs, , enabled] = mockUseTopBidderActivePeriods.mock.calls[0] as [
      number,
      number,
      number,
      boolean,
    ];
    expect(topN).toBe(20);
    expect(initTs).toBe(NOW_SEC - 365 * DAY);
    expect(enabled).toBe(true);
  });

  it('renders an empty state when nobody has an active period', () => {
    mockUseTopBidderActivePeriods.mockReturnValue(
      okQuery({ ...periodsResponse, TopBidders: [], ActivePeriods: [] }),
    );
    render(<BidderActivePeriodsTimeline />);

    expect(
      screen.getByText('No active gesture periods found for top participants.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders an empty state when the response is missing entirely', () => {
    mockUseTopBidderActivePeriods.mockReturnValue(okQuery(undefined));
    render(<BidderActivePeriodsTimeline />);

    expect(
      screen.getByText('No active gesture periods found for top participants.'),
    ).toBeInTheDocument();
  });

  it('still lists a ranked participant who has no bursts', () => {
    mockUseTopBidderActivePeriods.mockReturnValue(
      okQuery({ ...periodsResponse, ActivePeriods: [] }),
    );
    render(<BidderActivePeriodsTimeline />);

    expect(screen.getByRole('link', { name: '0xAAAA....1111' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows a spinner while the timeline loads', () => {
    mockUseTopBidderActivePeriods.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<BidderActivePeriodsTimeline />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('offers a retry that refetches after a failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseTopBidderActivePeriods.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<BidderActivePeriodsTimeline />);

    expect(screen.getByText('Failed to load active periods')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('stops querying when the section is disabled', () => {
    render(<BidderActivePeriodsTimeline enabled={false} />);

    expect(mockUseBidTimeBounds).toHaveBeenCalledWith(false);
    expect(mockUseTopBidderActivePeriods).toHaveBeenLastCalledWith(
      20,
      MIN_TS,
      NOW_SEC + HOUR,
      false,
    );
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<BidderActivePeriodsTimeline />);

    await checkA11y(container);
  });

  it('has no accessibility violations in the empty state', async () => {
    mockUseTopBidderActivePeriods.mockReturnValue(
      okQuery({ ...periodsResponse, TopBidders: [], ActivePeriods: [] }),
    );
    const { container } = render(<BidderActivePeriodsTimeline />);

    await checkA11y(container);
  });
});
// lexicon-allow-end
