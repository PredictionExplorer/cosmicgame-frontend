// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { BidderActivePeriod, TopBidderInfo } from '@/services/api/types';

import { act, checkA11y, render, screen, within } from '@/test-utils';

import { BidderActivePeriodsTimeline } from '../BidderActivePeriodsTimeline';

const mockUseBidTimeBounds = jest.fn();
const mockUseTopBidderActivePeriods = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useTopBidderActivePeriods: (...args: unknown[]) => mockUseTopBidderActivePeriods(...args),
}));
jest.mock('../../../hooks/useNow', () => ({ useNow: () => END * 1000 }));

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
  mockUseTopBidderActivePeriods.mockReturnValue(
    ok({ TopBidders: top, ActivePeriods: periods }),
  );
});

describe('BidderActivePeriodsTimeline', () => {
  it('summarizes the range and the most active participant', () => {
    render(<BidderActivePeriodsTimeline label="Top 20 participant active periods" />);
    const figure = screen.getByRole('figure', { name: 'Top 20 participant active periods' });
    expect(figure).toHaveTextContent(/2026\. Most gestures: 0x1Ec1….*\(810\)\./);
  });

  it('draws every lane on one axis spanning the whole range, the latest period included', () => {
    render(<BidderActivePeriodsTimeline label="Active periods" />);
    const lanes = within(screen.getByRole('group', { name: 'Active periods' })).getAllByRole(
      'group',
    );
    expect(lanes).toHaveLength(2);
    expect(lanes[0]).toHaveAccessibleName(/^1\. 0x1Ec1…/);
    expect(within(lanes[0]!).getAllByRole('img')).toHaveLength(3);
    const latest = within(lanes[0]!).getAllByRole('img').at(-1)!;
    const left = parseFloat((latest as HTMLElement).style.left);
    expect(left).toBeGreaterThan(95);
    expect(left).toBeLessThanOrEqual(100);
  });

  it('keeps one tab stop and steps through periods with the arrow keys', async () => {
    const user = userEvent.setup();
    const { container } = render(<BidderActivePeriodsTimeline label="Active periods" />);
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

  it('lists the lanes as a table on request', async () => {
    const user = userEvent.setup();
    render(<BidderActivePeriodsTimeline label="Active periods" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Active periods' });
    expect(within(table).getByText('810')).toBeInTheDocument();
    expect(within(table).getByText('3')).toBeInTheDocument();
  });

  it('says so when no participant has an active period', () => {
    mockUseTopBidderActivePeriods.mockReturnValue(ok({ TopBidders: [], ActivePeriods: [] }));
    render(<BidderActivePeriodsTimeline label="Active periods" />);
    expect(
      screen.getByText('No active gesture periods found for top participants.'),
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<BidderActivePeriodsTimeline label="Active periods" />);
    await checkA11y(container);
  });
});
// lexicon-allow-end
