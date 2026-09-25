// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { BidFrequencyBucket, DashboardInfo } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import { GestureFrequencyChart } from '../GestureFrequencyChart';
import { frequencyRange } from '../charts/activityRanges';

const mockUseBidTimeBounds = jest.fn();
const mockUseBidFrequency = jest.fn();
const mockUseDashboardInfo = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useBidFrequency: (...args: unknown[]) => mockUseBidFrequency(...args),
  useDashboardInfo: () => mockUseDashboardInfo(),
}));
jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

const HOUR = 3600;
const DAY = 86400;
/** 2026-08-12 00:00 UTC. */
const NOW_SEC = Date.UTC(2026, 7, 12) / 1000;
const NOW_MS = NOW_SEC * 1000;

const buckets: BidFrequencyBucket[] = [
  { BucketTs: NOW_SEC - 2 * DAY, NumBids: 1_234, UniqueBidders: 56 },
  { BucketTs: NOW_SEC - DAY, NumBids: 40, UniqueBidders: 12 },
];

/** A chart's readout as [label, figure] pairs. */
const readoutOf = (figure: HTMLElement) =>
  [...figure.querySelectorAll('figcaption dl > div')].map((item) => [
    item.querySelector('dt')?.textContent,
    item.querySelector('dd')?.textContent,
  ]);

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBidTimeBounds.mockReturnValue(ok({ MinTs: NOW_SEC - 30 * DAY, MaxTs: NOW_SEC }));
  mockUseBidFrequency.mockReturnValue(ok(buckets));
  mockUseDashboardInfo.mockReturnValue(ok({ MainStats: { TotalBids: 3_184 } }));
});

describe('GestureFrequencyChart', () => {
  // The key the page's server read seeds (activityRanges): the same range, so it is found.
  it('asks for the range the page seeds for its daily view', () => {
    render(<GestureFrequencyChart label="Frequency" />);
    const { initTs, finTs, intervalSecs } = frequencyRange(
      { firstTs: NOW_SEC - 30 * DAY, lastTs: NOW_SEC },
      'day',
    );
    expect(mockUseBidFrequency).toHaveBeenCalledWith(initTs, finTs, intervalSecs, true);
  });

  it('reads out the total and the busiest day above one bar per bucket', () => {
    render(<GestureFrequencyChart label="Gesture frequency over time" />);
    const figure = screen.getByRole('figure', { name: 'Gesture frequency over time' });
    // V300: figures a reader takes in at a glance, not a sentence.
    expect(readoutOf(figure)).toEqual([
      ['Gestures', '1,274'],
      ['Busiest day', '1,234'],
      // Beside the hub's total: every gesture, first hours included, so the two never clash.
      ['All gestures', '3,184'],
    ]);
    expect(figure.querySelector('figcaption')).toHaveTextContent('Aug 10, 2026');
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '2');
    // The opening hour's exclusion stays stated under the chart, in two lines at most.
    expect(screen.getByText(/first hour is left out/i)).toBeInTheDocument();
  });

  // The server's dashboard fills the every-gesture total in the first HTML; it once arrived
  // after hydration and pushed the plot 77px down (CLS 0.13 on a phone).
  it('reads the every-gesture total from the server’s dashboard until its own arrives', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(
      <GestureFrequencyChart
        label="Frequency"
        initialDashboard={{ MainStats: { TotalBids: 3_186 } } as unknown as DashboardInfo}
      />,
    );
    const figure = screen.getByRole('figure', { name: 'Frequency' });
    expect(readoutOf(figure)).toContainEqual(['All gestures', '3,186']);
  });

  it('asks for buckets only once the time bounds have settled', () => {
    mockUseBidTimeBounds.mockReturnValue({ data: undefined, isPending: true });
    render(<GestureFrequencyChart label="Frequency" />);
    // V120: no query for a placeholder range that the real bounds would replace.
    expect(mockUseBidFrequency.mock.calls.every((call) => call[3] === false)).toBe(true);
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('holds its range still when the bounds cannot be read', () => {
    mockUseBidTimeBounds.mockReturnValue({ data: undefined, isPending: false, isError: true });
    const now = jest.spyOn(Date, 'now').mockReturnValue(NOW_MS);
    const { rerender } = render(<GestureFrequencyChart label="Frequency" />);
    const first = mockUseBidFrequency.mock.calls.at(-1)!.slice(0, 3);
    expect(mockUseBidFrequency.mock.calls.at(-1)![3]).toBe(true);
    // Minutes later the page re-renders: the query's range, and so its key, do not move.
    now.mockReturnValue(NOW_MS + 10 * 60_000);
    rerender(<GestureFrequencyChart label="Frequency" />);
    expect(mockUseBidFrequency.mock.calls.at(-1)!.slice(0, 3)).toEqual(first);
    now.mockRestore();
  });

  it('puts round, grouped count ticks on the value axis', () => {
    render(<GestureFrequencyChart label="Frequency" />);
    const ticks = within(screen.getByTestId('y-axis'))
      .getAllByText(/\d/)
      .map((el) => el.textContent);
    expect(ticks).toEqual(['0', '500', '1,000', '1,500']);
  });

  it('switches to hourly buckets for the last week with one control', async () => {
    const user = userEvent.setup();
    render(<GestureFrequencyChart label="Frequency" />);
    await user.click(screen.getByRole('radio', { name: 'Hourly' }));
    const [from, , interval] = mockUseBidFrequency.mock.calls.at(-1)!;
    expect(interval).toBe(HOUR);
    expect(NOW_SEC - (from as number)).toBeLessThanOrEqual(7 * DAY);
    // A week of hours is not comparable with every gesture ever made.
    const figure = screen.getByRole('figure', { name: 'Frequency' });
    expect(readoutOf(figure).map(([label]) => label)).not.toContain('All gestures');
  });

  it('leaves the whole count out when the dashboard cannot be read', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<GestureFrequencyChart label="Frequency" />);
    const figure = screen.getByRole('figure', { name: 'Frequency' });
    expect(readoutOf(figure).map(([label]) => label)).toEqual(['Gestures', 'Busiest day']);
  });

  it('shows the same buckets as a table on request', async () => {
    const user = userEvent.setup();
    render(<GestureFrequencyChart label="Frequency" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Frequency' });
    expect(within(table).getByText('1,234')).toBeInTheDocument();
    expect(within(table).getByText('56')).toBeInTheDocument();
  });

  it('says so when every bucket is empty instead of drawing blank axes', () => {
    mockUseBidFrequency.mockReturnValue(
      ok([{ BucketTs: NOW_SEC - DAY, NumBids: 0, UniqueBidders: 0 }]),
    );
    render(<GestureFrequencyChart label="Frequency" />);
    expect(screen.getByText('No gesture activity in this time range.')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('offers a retry when the buckets fail to load', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseBidFrequency.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<GestureFrequencyChart label="Frequency" />);
    expect(screen.getByText('Failed to load gesture frequency')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(<GestureFrequencyChart label="Frequency" />);
    await checkA11y(container);
  });
});
// lexicon-allow-end
