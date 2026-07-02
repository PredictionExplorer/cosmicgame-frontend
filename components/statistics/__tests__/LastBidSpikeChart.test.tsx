// lexicon-allow-start: analytics fixtures mirror backend wire names
import userEvent from '@testing-library/user-event';

import type { BidSpike } from '@/services/api/types';

import { render, screen } from '@/test-utils';

import { LastBidSpikeChart } from '../LastBidSpikeChart';

const mockUseBidTimeBounds = jest.fn();
const mockUseBiddingActivity = jest.fn();
const mockUseBidFrequency = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTimeBounds: (...args: unknown[]) => mockUseBidTimeBounds(...args),
  useBiddingActivity: (...args: unknown[]) => mockUseBiddingActivity(...args),
  useBidFrequency: (...args: unknown[]) => mockUseBidFrequency(...args),
}));

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => 1_700_000_000_000,
}));

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
const BASE = 1_690_000_000 - (1_690_000_000 % HOUR);

/** Backend `Index` values intentionally do NOT match array positions. */
const spikes: BidSpike[] = [
  {
    Index: 7,
    StartTs: BASE,
    EndTs: BASE + HOUR,
    PeakTs: BASE,
    PeakNumBids: 10,
    TotalBids: 14,
    BucketCount: 2,
  },
  {
    Index: 12,
    StartTs: BASE + 10 * HOUR,
    EndTs: BASE + 11 * HOUR,
    PeakTs: BASE + 10 * HOUR,
    PeakNumBids: 30,
    TotalBids: 42,
    BucketCount: 2,
  },
];

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBidTimeBounds.mockReturnValue(okQuery({ MinTs: BASE - HOUR, MaxTs: BASE + 20 * HOUR }));
  mockUseBiddingActivity.mockReturnValue(okQuery({ Spikes: spikes, RecentSpikeIndex: 1 }));
  mockUseBidFrequency.mockReturnValue(okQuery([{ BucketTs: BASE, NumBids: 10 }]));
});

describe('LastBidSpikeChart spike selection', () => {
  it('selects spikes by array position even when backend Index values differ (regression)', async () => {
    const user = userEvent.setup();
    render(<LastBidSpikeChart />);

    // RecentSpikeIndex 1 → second spike selected on load.
    expect(screen.getByText(/viewing spike #2/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '#1' }));
    expect(screen.getByText(/viewing spike #1/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '#2' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('navigates between spikes with prev/next', async () => {
    const user = userEvent.setup();
    render(<LastBidSpikeChart />);

    const prev = screen.getByRole('button', { name: 'Previous spike' });
    const next = screen.getByRole('button', { name: 'Next spike' });

    // On the most recent spike (#2): next is disabled, prev works.
    expect(next).toBeDisabled();
    await user.click(prev);
    expect(screen.getByText(/viewing spike #1/i)).toBeInTheDocument();
    expect(prev).toBeDisabled();

    await user.click(next);
    expect(screen.getByText(/viewing spike #2/i)).toBeInTheDocument();
  });

  it('shows the spike metadata for the selected spike', () => {
    render(<LastBidSpikeChart />);
    expect(screen.getByText(/peak 30 gestures\/hr/i)).toBeInTheDocument();
  });

  it('shows an empty state when no spikes are detected', () => {
    mockUseBiddingActivity.mockReturnValue(okQuery({ Spikes: [], RecentSpikeIndex: -1 }));
    render(<LastBidSpikeChart />);
    expect(screen.getByText(/no gesture spikes detected/i)).toBeInTheDocument();
  });

  it('shows an error state with retry when spike detection fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseBiddingActivity.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<LastBidSpikeChart />);
    expect(screen.getByText(/failed to load gesture spikes/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
// lexicon-allow-end
