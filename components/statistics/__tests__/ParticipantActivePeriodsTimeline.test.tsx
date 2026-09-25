// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { BidderActivePeriod, TopBidderInfo } from '@/services/api/types';

import { act, checkA11y, render, screen, within } from '@/test-utils';

import { ParticipantActivePeriodsTimeline } from '../ParticipantActivePeriodsTimeline';
import { ACTIVE_PERIODS_TOP_N, activePeriodsRange } from '../charts/activityRanges';

const mockUseBidTimeBounds = jest.fn();
const mockUseTopBidderActivePeriods = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useTopBidderActivePeriods: (...args: unknown[]) => mockUseTopBidderActivePeriods(...args),
}));

const DAY = 86_400;
const START = Date.UTC(2026, 4, 8) / 1000;
const END = START + 140 * DAY;

const ALICE = '0x1Ec14aDaf61e27AB339bc590BA4Bf2356Dd7E990';
const BOB = '0x7406aB5a1C7a4a4E8f8F7e9D2cD4b6C7d8E9Bc6c';

const top: TopBidderInfo[] = [
  { BidderAid: 1, BidderAddr: ALICE, NumBids: 810 },
  { BidderAid: 2, BidderAddr: BOB, NumBids: 479 },
];

const period = (aid: number, addr: string, day: number, bids: number): BidderActivePeriod => ({
  BidderAid: aid,
  BidderAddr: addr,
  PeriodStart: START + day * DAY,
  PeriodEnd: START + day * DAY + 3_600,
  NumBids: bids,
  DurationSecs: 3_600,
});

const periods = [
  period(1, ALICE, 60, 40),
  period(1, ALICE, 90, 30),
  period(1, ALICE, 139, 12),
  period(2, BOB, 2, 9),
];

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBidTimeBounds.mockReturnValue(ok({ MinTs: START, MaxTs: END }));
  mockUseTopBidderActivePeriods.mockReturnValue(ok({ TopBidders: top, ActivePeriods: periods }));
});

describe('ParticipantActivePeriodsTimeline', () => {
  // The key the page's server read seeds (activityRanges): the same range, so it is found.
  it('asks for the range the page seeds', () => {
    render(<ParticipantActivePeriodsTimeline label="Top 20 participant active periods" />);
    const { initTs, finTs } = activePeriodsRange({ firstTs: START, lastTs: END });
    expect(mockUseTopBidderActivePeriods).toHaveBeenCalledWith(
      ACTIVE_PERIODS_TOP_N,
      initTs,
      finTs,
      true,
    );
  });

  it('reads out the most active participant and the longest period', () => {
    render(<ParticipantActivePeriodsTimeline label="Top 20 participant active periods" />);
    const figure = screen.getByRole('figure', { name: 'Top 20 participant active periods' });
    const figures = [...figure.querySelectorAll('figcaption dl > div')].map((item) =>
      [...item.querySelectorAll('dt, dd')].map((cell) => cell.textContent),
    );
    expect(figures).toEqual([
      ['Most gestures', '810', '0x1Ec1…\u2060E990'],
      ['Longest period', '1h', '0x1Ec1…\u2060E990'],
    ]);
  });

  it('draws every lane on one axis spanning the whole range, the latest period included', () => {
    render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    const lanes = within(screen.getByRole('group', { name: 'Active periods' })).getAllByRole(
      'group',
    );
    expect(lanes).toHaveLength(2);
    expect(lanes[0]).toHaveAccessibleName(/^1\. 0x1Ec1…/);
    expect(within(lanes[0]!).getAllByRole('img')).toHaveLength(3);
    const latest = within(lanes[0]!).getAllByRole('img').at(-1)!;
    const left = parseFloat((latest as HTMLElement).style.getPropertyValue('--mark-at'));
    expect(left).toBeGreaterThan(95);
    expect(left).toBeLessThanOrEqual(100);
  });

  it('says a lane has no active period instead of leaving it blank', () => {
    // Regression: participants whose gestures were never within six hours drew empty lanes.
    const CAROL = '0x0000000000000000000000000000000000000c0c';
    mockUseTopBidderActivePeriods.mockReturnValue(
      ok({
        TopBidders: [...top, { BidderAid: 3, BidderAddr: CAROL, NumBids: 7 }],
        ActivePeriods: periods,
      }),
    );
    render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    const lanes = within(screen.getByRole('group', { name: 'Active periods' })).getAllByRole(
      'group',
    );
    expect(within(lanes[2]!).queryAllByRole('img')).toHaveLength(0);
    expect(within(lanes[2]!).getByText('No active period')).toBeInTheDocument();
  });

  it('pins a tapped period in the readout, since a finger has no hover', async () => {
    const user = userEvent.setup();
    const { container } = render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    const group = screen.getByRole('group', { name: 'Active periods' });
    const mark = within(group).getAllByRole('img')[1]!;
    await user.click(mark);
    await user.unhover(group);
    const readout = container.querySelector('[aria-live="polite"]')!;
    expect(readout.textContent).toBe(mark.getAttribute('aria-label'));
  });

  it('puts the address above its lane on a phone, so the plot spans the width', () => {
    render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    const lane = within(screen.getByRole('group', { name: 'Active periods' })).getAllByRole(
      'group',
    )[0]!;
    expect(lane).toHaveClass('grid-cols-1');
    expect(lane.className).toContain('sm:grid-cols-[minmax(7.5rem,11rem)_minmax(0,1fr)]');
  });

  it('keeps one tab stop and steps through periods with the arrow keys', async () => {
    const user = userEvent.setup();
    const { container } = render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    const bars = screen.getAllByRole('img');
    expect(bars.filter((bar) => bar.tabIndex === 0)).toHaveLength(1);
    const readout = container.querySelector('[aria-live="polite"]')!;

    act(() => bars[0]!.focus());
    expect(readout).toHaveTextContent(/^0x1Ec1….* from /);
    await user.keyboard('{ArrowRight}');
    expect(bars[1]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(bars[3]).toHaveFocus();
    expect(readout).toHaveTextContent(/^0x7406…/);
  });

  it('leaves the arrow keys alone on a lane address link', async () => {
    const user = userEvent.setup();
    render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    const group = screen.getByRole('group', { name: 'Active periods' });
    expect(group).not.toHaveClass('focus-ring-within');
    const link = within(group).getAllByRole('link')[0]!;
    act(() => link.focus());
    for (const key of ['{ArrowRight}', '{ArrowDown}', '{End}', '{Home}']) {
      await user.keyboard(key);
      expect(link).toHaveFocus();
    }
  });

  it('draws a focused period ring outside the period and tints its lane', () => {
    render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    for (const bar of screen.getAllByRole('img')) {
      expect(bar).toHaveClass('focus-visible:outline-solid', 'focus-visible:z-10');
      expect(bar.parentElement).not.toHaveClass('overflow-hidden');
    }
    const lanes = within(screen.getByRole('group', { name: 'Active periods' })).getAllByRole(
      'group',
    );
    for (const lane of lanes) {
      expect(lane.className).toContain('has-[[role=img]:focus-visible]:bg-surface');
    }
  });

  it('lists the lanes as a table on request', async () => {
    const user = userEvent.setup();
    render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Active periods' });
    expect(within(table).getByText('810')).toBeInTheDocument();
    expect(within(table).getByText('3')).toBeInTheDocument();
  });

  it('says so when no participant has an active period', () => {
    mockUseTopBidderActivePeriods.mockReturnValue(ok({ TopBidders: [], ActivePeriods: [] }));
    render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    expect(
      screen.getByText('No active gesture periods found for top participants.'),
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ParticipantActivePeriodsTimeline label="Active periods" />);
    await checkA11y(container);
  });
});
// lexicon-allow-end
