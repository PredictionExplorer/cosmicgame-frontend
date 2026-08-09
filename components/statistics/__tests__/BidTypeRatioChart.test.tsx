// lexicon-allow-start: analytics fixtures mirror sealed backend wire names
import userEvent from '@testing-library/user-event';

import type { BidTypeRatioBucket } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import { BidTypeRatioChart } from '../BidTypeRatioChart';

const mockUseBidTypeRatio = jest.fn();
const mockUseCurrentTime = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useBidTypeRatio: (...args: unknown[]) => mockUseBidTypeRatio(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => CLIENT_NOW_SEC * 1000,
}));

/** See BidFrequencyChart.test for why recharts is stubbed in jsdom. */
jest.mock('recharts', () => {
  const React = require('react');
  const lastRender: { data: unknown[] } = { data: [] };
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ data, children }: { data: unknown[]; children: React.ReactNode }) => {
      lastRender.data = data;
      return (
        <div data-testid="area-chart" data-point-count={data.length}>
          {children}
        </div>
      );
    },
    Area: ({ type, dataKey }: { type: string; dataKey: string }) => (
      <div data-testid={`area-${dataKey}`} data-interpolation={type} />
    ),
    XAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
      <div data-testid="x-axis-tick">
        {tickFormatter ? tickFormatter((lastRender.data[0] as { bucketTs: number }).bucketTs) : ''}
      </div>
    ),
    YAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
      <div data-testid="y-axis-tick">{tickFormatter ? tickFormatter(50) : ''}</div>
    ),
    CartesianGrid: () => null,
    Legend: () => <div data-testid="legend" />,
    Tooltip: ({ content }: { content: React.ReactElement }) =>
      React.cloneElement(content, {
        active: true,
        payload: [{ payload: lastRender.data[0] }],
      }),
  };
});

const HOUR = 3600;
const DAY = 86400;
const ROUND_START = 1_700_000_000 - (1_700_000_000 % DAY);
const SIX_HOURS = 6 * HOUR;
const CLIENT_NOW_SEC = ROUND_START + 5 * HOUR;

const ratioBuckets: BidTypeRatioBucket[] = [
  {
    BucketTs: ROUND_START,
    EthPct: 62.5,
    RwalkPct: 25,
    CstPct: 12.5,
    EthBids: 5,
    RwalkBids: 2,
    CstBids: 1,
    TotalBids: 8,
  },
  {
    BucketTs: ROUND_START + SIX_HOURS,
    EthPct: 50,
    RwalkPct: 0,
    CstPct: 50,
    EthBids: 1,
    RwalkBids: 0,
    CstBids: 1,
    TotalBids: 2,
  },
];

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

function lastQueryArgs() {
  return mockUseBidTypeRatio.mock.calls[mockUseBidTypeRatio.mock.calls.length - 1] as [
    number,
    number,
    number,
    boolean,
  ];
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCurrentTime.mockReturnValue(okQuery(ROUND_START + 5 * HOUR));
  mockUseBidTypeRatio.mockReturnValue(okQuery(ratioBuckets));
});

describe('BidTypeRatioChart', () => {
  it('plots one point per sampled window', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByTestId('area-chart')).toHaveAttribute('data-point-count', '2');
    expect(screen.getByTestId('area-ethPct')).toBeInTheDocument();
    expect(screen.getByTestId('area-rwalkPct')).toBeInTheDocument();
    expect(screen.getByTestId('area-cstPct')).toBeInTheDocument();
  });

  it('starts on six-hour samples with smooth interpolation', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByRole('button', { name: '6h' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Smooth' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('area-ethPct')).toHaveAttribute('data-interpolation', 'monotone');
    expect(lastQueryArgs()[2]).toBe(SIX_HOURS);
  });

  it('re-samples at the interval the user picks', async () => {
    const user = userEvent.setup();
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    await user.click(screen.getByRole('button', { name: '1h' }));

    expect(screen.getByRole('button', { name: '1h' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '6h' })).toHaveAttribute('aria-pressed', 'false');
    expect(lastQueryArgs()[2]).toBe(HOUR);
  });

  it('redraws with the interpolation the user picks without refetching', async () => {
    const user = userEvent.setup();
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);
    const argsBefore = lastQueryArgs();

    await user.click(screen.getByRole('button', { name: 'Step' }));

    expect(screen.getByTestId('area-ethPct')).toHaveAttribute('data-interpolation', 'step');
    expect(lastQueryArgs()).toEqual(argsBefore);
  });

  it('aligns the window end to the bucket grid', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);
    const [fromTs, toTs, intervalSecs] = lastQueryArgs();

    expect(fromTs).toBe(ROUND_START);
    expect((toTs - fromTs) % intervalSecs).toBe(0);
    expect(toTs).toBe(ROUND_START + SIX_HOURS);
  });

  it('keeps the same window while the clock ticks inside one bucket', () => {
    // The query key used to churn on every clock tick, dropping `data` to
    // undefined and visibly blanking the chart before it refetched.
    const { rerender } = render(<BidTypeRatioChart roundStartTs={ROUND_START} />);
    const before = lastQueryArgs();

    mockUseCurrentTime.mockReturnValue(okQuery(ROUND_START + 5 * HOUR + 59 * 60));
    rerender(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(lastQueryArgs()).toEqual(before);
  });

  it('extends the window once the clock crosses into the next bucket', () => {
    const { rerender } = render(<BidTypeRatioChart roundStartTs={ROUND_START} />);
    const [, toTsBefore] = lastQueryArgs();

    mockUseCurrentTime.mockReturnValue(okQuery(ROUND_START + 7 * HOUR));
    rerender(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(lastQueryArgs()[1]).toBe(toTsBefore + SIX_HOURS);
  });

  it('falls back to the client clock when the chain time is unavailable', () => {
    mockUseCurrentTime.mockReturnValue(okQuery(0));
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    // The client clock also sits in the first six-hour window.
    expect(lastQueryArgs()[1]).toBe(ROUND_START + SIX_HOURS);
  });

  it('always keeps at least one bucket in the window', () => {
    mockUseCurrentTime.mockReturnValue(okQuery(ROUND_START));
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    const [fromTs, toTs] = lastQueryArgs();
    expect(toTs).toBeGreaterThan(fromTs);
  });

  it('breaks down the composition in the tooltip', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByText(/62\.50%/)).toBeInTheDocument();
    expect(screen.getByText(/25\.00%/)).toBeInTheDocument();
    expect(screen.getByText(/12\.50%/)).toBeInTheDocument();
    expect(screen.getByText('Total gestures')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('labels the vertical axis as a percentage share', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByTestId('y-axis-tick')).toHaveTextContent('50%');
  });

  it('includes the time of day on the axis for sub-daily samples', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByTestId('x-axis-tick')).toHaveTextContent('Nov 14, 2023 00:00 UTC');
  });

  it('drops the time of day once samples span a whole day', async () => {
    const user = userEvent.setup();
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    await user.click(screen.getByRole('button', { name: '1d' }));

    expect(screen.getByTestId('x-axis-tick')).toHaveTextContent('Nov 14, 2023');
    expect(screen.getByTestId('x-axis-tick').textContent).not.toContain(':');
  });

  it('explains that samples are windowed rather than cumulative', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByText(/per-interval, not cumulative/i)).toBeInTheDocument();
  });

  it('says the cycle has not started and skips the query when there is no start time', () => {
    render(<BidTypeRatioChart roundStartTs={0} />);

    expect(screen.getByText(/round hasn’t started yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    expect(lastQueryArgs()[3]).toBe(false);
  });

  it('renders an empty state when the cycle has no gestures yet', () => {
    mockUseBidTypeRatio.mockReturnValue(okQuery([]));
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByText('No gesture activity in the current round yet.')).toBeInTheDocument();
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
  });

  it('shows a spinner while the composition loads', () => {
    mockUseBidTypeRatio.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('offers a retry that refetches after a failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseBidTypeRatio.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    expect(screen.getByText('Failed to load gesture-type distribution')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('stops querying when the section is disabled', () => {
    render(<BidTypeRatioChart roundStartTs={ROUND_START} enabled={false} />);

    expect(lastQueryArgs()[3]).toBe(false);
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    await checkA11y(container);
  });

  it('has no accessibility violations in the empty state', async () => {
    mockUseBidTypeRatio.mockReturnValue(okQuery([]));
    const { container } = render(<BidTypeRatioChart roundStartTs={ROUND_START} />);

    await checkA11y(container);
  });
});
// lexicon-allow-end
