// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { BidFrequencyBucket } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import { BidFrequencyChart } from '../BidFrequencyChart';

const mockUseBidTimeBounds = jest.fn();
const mockUseBidFrequency = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useBidFrequency: (...args: unknown[]) => mockUseBidFrequency(...args),
}));

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => NOW_MS,
}));

/**
 * Recharts needs a measured container, which jsdom never provides, so the
 * chart internals are stubbed. `Tooltip` renders its `content` element with
 * the first datum so the real tooltip component is still exercised — that is
 * the only user-visible part of the chart in this environment.
 */
jest.mock('recharts', () => {
  const React = require('react');
  const lastRender: { data: unknown[] } = { data: [] };
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ data, children }: { data: unknown[]; children: React.ReactNode }) => {
      lastRender.data = data;
      return (
        <div data-testid="bar-chart" data-point-count={data.length}>
          {children}
        </div>
      );
    },
    Bar: () => null,
    XAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
      <div data-testid="x-axis-tick">
        {tickFormatter ? tickFormatter((lastRender.data[0] as { bucketTs: number }).bucketTs) : ''}
      </div>
    ),
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: ({ content }: { content: React.ReactElement }) =>
      React.cloneElement(content, {
        active: true,
        payload: [{ payload: lastRender.data[0] }],
      }),
  };
});

const HOUR = 3600;
const DAY = 86400;
const NOW_SEC = 1_700_000_000 - (1_700_000_000 % DAY);
const NOW_MS = NOW_SEC * 1000;

const buckets: BidFrequencyBucket[] = [
  { BucketTs: NOW_SEC - 2 * DAY, NumBids: 1_234, UniqueBidders: 56 },
  { BucketTs: NOW_SEC - DAY, NumBids: 40, UniqueBidders: 12 },
];

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBidTimeBounds.mockReturnValue(okQuery({ MinTs: NOW_SEC - 30 * DAY, MaxTs: NOW_SEC }));
  mockUseBidFrequency.mockReturnValue(okQuery(buckets));
});

describe('BidFrequencyChart', () => {
  it('plots one point per bucket and explains the excluded opening hour', () => {
    render(<BidFrequencyChart />);

    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '2');
    expect(screen.getByText(/first hour after each cycle opens are excluded/i)).toBeInTheDocument();
  });

  it('starts on daily buckets', () => {
    render(<BidFrequencyChart />);

    expect(screen.getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Hourly' })).toHaveAttribute('aria-pressed', 'false');
    expect(mockUseBidFrequency).toHaveBeenLastCalledWith(
      expect.any(Number),
      expect.any(Number),
      DAY,
      true,
    );
  });

  it('re-queries with hourly buckets when the user switches granularity', async () => {
    const user = userEvent.setup();
    render(<BidFrequencyChart />);

    await user.click(screen.getByRole('button', { name: 'Hourly' }));

    expect(screen.getByRole('button', { name: 'Hourly' })).toHaveAttribute('aria-pressed', 'true');
    expect(mockUseBidFrequency).toHaveBeenLastCalledWith(
      expect.any(Number),
      expect.any(Number),
      HOUR,
      true,
    );
  });

  it('extends the window by one bucket so the newest gestures are not cut off', () => {
    render(<BidFrequencyChart />);

    const [, finTs] = mockUseBidFrequency.mock.calls[0] as [number, number, number, boolean];
    expect(finTs).toBe(NOW_SEC + DAY);
  });

  it('caps the lookback at a year even when the data reaches further back', () => {
    mockUseBidTimeBounds.mockReturnValue(okQuery({ MinTs: NOW_SEC - 900 * DAY, MaxTs: NOW_SEC }));
    render(<BidFrequencyChart />);

    const [initTs] = mockUseBidFrequency.mock.calls[0] as [number, number, number, boolean];
    expect(initTs).toBe(NOW_SEC - 365 * DAY);
  });

  it('falls back to the client clock when the time bounds are unknown', () => {
    mockUseBidTimeBounds.mockReturnValue(okQuery(undefined));
    render(<BidFrequencyChart />);

    const [initTs] = mockUseBidFrequency.mock.calls[0] as [number, number, number, boolean];
    expect(initTs).toBe(NOW_SEC - 365 * DAY);
  });

  it('shows counts and unique participants in the tooltip', () => {
    render(<BidFrequencyChart />);

    expect(screen.getByText('Gestures')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Unique participants')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
  });

  it('renders an empty state instead of a chart when no gestures fall in range', () => {
    mockUseBidFrequency.mockReturnValue(okQuery([]));
    render(<BidFrequencyChart />);

    expect(screen.getByText('No gesture activity in this time range.')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('keeps the bucket toggle usable while the empty state shows', () => {
    mockUseBidFrequency.mockReturnValue(okQuery([]));
    render(<BidFrequencyChart />);

    expect(screen.getByRole('button', { name: 'Hourly' })).toBeEnabled();
  });

  it('shows a spinner while the buckets load', () => {
    mockUseBidFrequency.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<BidFrequencyChart />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('offers a retry that refetches after a failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseBidFrequency.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<BidFrequencyChart />);

    expect(screen.getByText('Failed to load gesture frequency')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('stops querying when the section is disabled', () => {
    render(<BidFrequencyChart enabled={false} />);

    expect(mockUseBidTimeBounds).toHaveBeenCalledWith(false);
    expect(mockUseBidFrequency).toHaveBeenLastCalledWith(
      expect.any(Number),
      expect.any(Number),
      DAY,
      false,
    );
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<BidFrequencyChart />);

    await checkA11y(container);
  });

  it('has no accessibility violations in the empty state', async () => {
    mockUseBidFrequency.mockReturnValue(okQuery([]));
    const { container } = render(<BidFrequencyChart />);

    await checkA11y(container);
  });
});
// lexicon-allow-end
