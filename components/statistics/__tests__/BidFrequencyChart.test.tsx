// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { BidFrequencyBucket } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import { BidFrequencyChart } from '../BidFrequencyChart';

const mockUseBidTimeBounds = jest.fn();
const mockUseBidFrequency = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useBidFrequency: (...args: unknown[]) => mockUseBidFrequency(...args),
}));
jest.mock('../../../hooks/useNow', () => ({ useNow: () => NOW_MS }));
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

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBidTimeBounds.mockReturnValue(ok({ MinTs: NOW_SEC - 30 * DAY, MaxTs: NOW_SEC }));
  mockUseBidFrequency.mockReturnValue(ok(buckets));
});

describe('BidFrequencyChart', () => {
  it('reads the range in one sentence and plots one bar per bucket', () => {
    render(<BidFrequencyChart label="Gesture frequency over time" />);
    const figure = screen.getByRole('figure', { name: 'Gesture frequency over time' });
    // The opening-hour exclusion stands beside the total it changes.
    expect(
      within(figure).getByText(
        /Gestures, .*: 1,274, not counting the first hour of each cycle\. Busiest day: .*\(1,234\)\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '2');
    // The opening hour's exclusion stays stated under the chart.
    expect(screen.getByText(/first hour after each cycle opens/i)).toBeInTheDocument();
  });

  it('puts round, grouped count ticks on the value axis', () => {
    render(<BidFrequencyChart label="Frequency" />);
    const ticks = within(screen.getByTestId('y-axis'))
      .getAllByText(/\d/)
      .map((el) => el.textContent);
    expect(ticks).toEqual(['0', '500', '1,000', '1,500']);
  });

  it('switches to hourly buckets for the last week with one control', async () => {
    const user = userEvent.setup();
    render(<BidFrequencyChart label="Frequency" />);
    await user.click(screen.getByRole('radio', { name: 'Hourly' }));
    const [from, , interval] = mockUseBidFrequency.mock.calls.at(-1)!;
    expect(interval).toBe(HOUR);
    expect(NOW_SEC - (from as number)).toBeLessThanOrEqual(7 * DAY);
  });

  it('shows the same buckets as a table on request', async () => {
    const user = userEvent.setup();
    render(<BidFrequencyChart label="Frequency" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Frequency' });
    expect(within(table).getByText('1,234')).toBeInTheDocument();
    expect(within(table).getByText('56')).toBeInTheDocument();
  });

  it('says so when every bucket is empty instead of drawing blank axes', () => {
    mockUseBidFrequency.mockReturnValue(
      ok([{ BucketTs: NOW_SEC - DAY, NumBids: 0, UniqueBidders: 0 }]),
    );
    render(<BidFrequencyChart label="Frequency" />);
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
    render(<BidFrequencyChart label="Frequency" />);
    expect(screen.getByText('Failed to load gesture frequency')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(<BidFrequencyChart label="Frequency" />);
    await checkA11y(container);
  });
});
// lexicon-allow-end
