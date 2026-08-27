import userEvent from '@testing-library/user-event';

import type { GestureInfo } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import CstCalibrationWindowChart, {
  CstCalibrationWindowView,
  CstCalibrationWindowSection,
} from '../CstCalibrationWindowChart';

const mockUseGestureListByCycle = jest.fn();
const mockUseRoundInfo = jest.fn();
const mockUseCurrentTime = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));

jest.mock('../../../hooks/useNow', () => ({
  useNow: () => NOW_MS,
}));

/**
 * Recharts needs a measured container, which jsdom never provides, so the
 * chart internals are stubbed. `Line` invokes the real per-gesture dot
 * renderer, the axes exercise the real tick formatters, and `Tooltip` renders
 * its `content` element with the first datum so the real tooltip component is
 * still exercised.
 */
jest.mock('recharts', () => {
  const React = require('react');
  const lastRender: { data: unknown[] } = { data: [] };
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    ComposedChart: ({ data, children }: { data: unknown[]; children: React.ReactNode }) => {
      lastRender.data = data;
      return (
        <div data-testid="composed-chart" data-point-count={data.length}>
          {children}
        </div>
      );
    },
    Line: ({ dot, name }: { dot?: (props: object) => React.ReactElement; name?: string }) => (
      <svg data-testid="step-line" data-name={name}>
        {typeof dot === 'function'
          ? lastRender.data.map((payload, index) => dot({ cx: index, cy: index, index, payload }))
          : null}
      </svg>
    ),
    XAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
      <div data-testid="x-axis-ticks">
        {tickFormatter ? [0.5, 1, 1.5, 24, 36].map((v) => tickFormatter(v)).join(' ') : ''}
      </div>
    ),
    YAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
      <div data-testid="y-axis-ticks">
        {tickFormatter
          ? [0, 1800, 3600, 5400, 86400, 129600].map((v) => tickFormatter(v)).join(' ')
          : ''}
      </div>
    ),
    CartesianGrid: () => null,
    Tooltip: ({ content }: { content: React.ReactElement }) =>
      React.cloneElement(content, {
        active: true,
        payload: [{ payload: lastRender.data[0] }],
      }),
  };
});

const NOW_SEC = 1_700_000_000;
const NOW_MS = NOW_SEC * 1000;
const T0 = NOW_SEC - 10_000;

const ADDR_A = '0xA1b2C3d4E5f60718293a4B5c6D7e8F9012345678';
const ADDR_B = '0xB1b2C3d4E5f60718293a4B5c6D7e8F9012345678';
const ADDR_C = '0xC1b2C3d4E5f60718293a4B5c6D7e8F9012345678';

const gestures = [
  { TimeStamp: T0, GestureType: 0, BidderAddr: ADDR_A, CstDutchAuctionDurationInt: 10_000 },
  { TimeStamp: T0 + 3_600, GestureType: 1, BidderAddr: ADDR_B, CstDutchAuctionDurationInt: 9_960 },
  { TimeStamp: T0 + 7_200, GestureType: 2, BidderAddr: ADDR_C, CstDutchAuctionDurationInt: 10_000 },
] as unknown as GestureInfo[];

const legacyGestures = [
  { TimeStamp: T0, GestureType: 0, BidderAddr: ADDR_A, CstDutchAuctionDurationInt: -1 },
] as unknown as GestureInfo[];

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(okQuery(gestures));
  mockUseRoundInfo.mockReturnValue(okQuery(null));
  mockUseCurrentTime.mockReturnValue(okQuery(NOW_SEC));
});

describe('CstCalibrationWindowView', () => {
  it('plots one step per gesture plus the open-ended live point', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive />);

    // 3 gestures + 1 synthetic "now" point.
    expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-point-count', '4');
    expect(screen.getByTestId('cst-calibration-window-chart')).toBeInTheDocument();
  });

  it('renders per-gesture dots colored by type, none for the synthetic point', () => {
    const { container } = render(<CstCalibrationWindowView gestures={gestures} isLive />);

    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(3);
    expect(circles[0]).toHaveAttribute('fill', '#15bffd'); // ETH
    expect(circles[1]).toHaveAttribute('fill', '#fbbf24'); // RandomWalk
    expect(circles[2]).toHaveAttribute('fill', '#9C37FD'); // CST
  });

  it('shows the low/high/now summary for the live cycle', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive />);

    expect(screen.getByText(/^Low:/)).toBeInTheDocument();
    expect(screen.getByText(/^High:/)).toBeInTheDocument();
    expect(screen.getByText(/^Now:/)).toBeInTheDocument();
  });

  it('labels the closing value "At finalization" for a finalized cycle', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive={false} roundEndTs={T0 + 9_000} />);

    expect(screen.getByText(/^At finalization:/)).toBeInTheDocument();
    expect(screen.queryByText(/^Now:/)).not.toBeInTheDocument();
  });

  it('shows the gesture type and participant in the tooltip', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive />);

    expect(screen.getByText('Window after this gesture')).toBeInTheDocument();
    // First datum is the ETH gesture; the legend repeats the same label.
    expect(screen.getAllByText('ETH gesture (shortens)').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/0xA1b2/)).toBeInTheDocument();
  });

  it('formats axis ticks across minute/hour/day ranges', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive />);

    expect(screen.getByTestId('x-axis-ticks')).toHaveTextContent('30m 1h 1.5h 1d 1.5d');
    expect(screen.getByTestId('y-axis-ticks')).toHaveTextContent('0 30m 1h 1.5h 1d 1.5d');
  });

  it('renders the legend for all three gesture types and the explainer', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive />);

    expect(screen.getByText('ETH + RandomWalk gesture (shortens)')).toBeInTheDocument();
    expect(screen.getAllByText('CST gesture (lengthens)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Every ETH gesture shortens the window/)).toBeInTheDocument();
  });

  it('shows the empty state for cycles without per-gesture window data', () => {
    render(<CstCalibrationWindowView gestures={legacyGestures} isLive />);

    expect(
      screen.getByText(/No per-gesture Calibration Window data for this round/),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<CstCalibrationWindowView gestures={gestures} isLive />);
    await checkA11y(container);
  });

  it('has no accessibility violations in the empty state', async () => {
    const { container } = render(<CstCalibrationWindowView gestures={legacyGestures} isLive />);
    await checkA11y(container);
  });
});

describe('CstCalibrationWindowChart', () => {
  it('asks the user to select a round when none is chosen', () => {
    render(<CstCalibrationWindowChart round={-1} isLive={false} />);

    expect(screen.getByText('Select a round to inspect.')).toBeInTheDocument();
  });

  it('shows a spinner while the gesture list loads', () => {
    mockUseGestureListByCycle.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<CstCalibrationWindowChart round={2} isLive />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
  });

  it('offers a retry that refetches after a failure', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseGestureListByCycle.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<CstCalibrationWindowChart round={2} isLive />);

    expect(screen.getByText('Failed to load Calibration Window timeline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('fetches the round ascending and skips round info for the live round', () => {
    render(<CstCalibrationWindowChart round={2} isLive />);

    expect(mockUseGestureListByCycle).toHaveBeenCalledWith(2, 'asc');
    expect(mockUseRoundInfo).toHaveBeenCalledWith(-1);
  });

  it('ends a finalized round at its claim timestamp', () => {
    mockUseRoundInfo.mockReturnValue(okQuery({ TimeStamp: T0 + 9_000 }));
    render(<CstCalibrationWindowChart round={1} isLive={false} />);

    expect(mockUseRoundInfo).toHaveBeenCalledWith(1);
    expect(screen.getByText(/^At finalization:/)).toBeInTheDocument();
  });
});

describe('CstCalibrationWindowSection round picker', () => {
  it('starts on the live round', () => {
    render(<CstCalibrationWindowSection currentRoundNum={5} />);

    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(5);
    expect(screen.getByText('Live round')).toBeInTheDocument();
  });

  it('follows the live round when it advances', () => {
    const { rerender } = render(<CstCalibrationWindowSection currentRoundNum={5} />);
    rerender(<CstCalibrationWindowSection currentRoundNum={6} />);

    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(6);
    expect(screen.getByText('Live round')).toBeInTheDocument();
  });

  it('keeps a user-pinned round when the live round advances', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CstCalibrationWindowSection currentRoundNum={5} />);

    await user.click(screen.getByRole('button', { name: 'Previous round' }));
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(4);

    rerender(<CstCalibrationWindowSection currentRoundNum={6} />);
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(4);
  });

  it('resumes following live after "Jump to live"', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CstCalibrationWindowSection currentRoundNum={5} />);

    await user.click(screen.getByRole('button', { name: 'Previous round' }));
    await user.click(screen.getByRole('button', { name: 'Jump to live' }));
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(5);

    rerender(<CstCalibrationWindowSection currentRoundNum={7} />);
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(7);
  });

  it('accepts a typed round number, clamped to the valid range', async () => {
    const user = userEvent.setup();
    render(<CstCalibrationWindowSection currentRoundNum={5} />);

    const input = screen.getByRole('spinbutton', { name: 'Round number' });
    await user.clear(input);
    await user.type(input, '3');
    expect(input).toHaveValue(3);
  });

  it('follows a late-arriving dashboard round (initial -1)', () => {
    const { rerender } = render(<CstCalibrationWindowSection currentRoundNum={-1} />);
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(0);

    rerender(<CstCalibrationWindowSection currentRoundNum={4} />);
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(4);
  });
});
