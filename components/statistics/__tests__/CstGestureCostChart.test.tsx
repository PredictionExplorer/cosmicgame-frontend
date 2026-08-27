import userEvent from '@testing-library/user-event';

import type { GestureInfo } from '@/services/api/types';

import { checkA11y, render, screen } from '@/test-utils';

import CstGestureCostChart, {
  CstGestureCostView,
  CstGestureCostSection,
} from '../CstGestureCostChart';

const mockUseGestureListByCycle = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
}));

/**
 * Recharts needs a measured container, which jsdom never provides, so the
 * chart internals are stubbed. `Line` invokes the real dot renderer, the axes
 * exercise the real tick formatters, and `Tooltip` renders its `content`
 * element with the first datum so the real tooltip component is exercised.
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
    Line: ({
      dot,
      dataKey,
      name,
    }: {
      dot?: ((props: object) => React.ReactElement) | boolean;
      dataKey?: string;
      name?: string;
    }) => (
      <svg data-testid={`line-${dataKey}`} data-name={name}>
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
    YAxis: ({
      yAxisId,
      ticks,
      tickFormatter,
    }: {
      yAxisId?: string;
      ticks?: number[];
      tickFormatter?: (value: number) => string;
    }) => (
      <div data-testid={`y-axis-${yAxisId}`}>
        {tickFormatter
          ? (ticks ?? [0, 1800, 3600, 86400, 129600]).map((v) => tickFormatter(v)).join(' ')
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

const T0 = 1_700_000_000;

const ADDR_A = '0xA1b2C3d4E5f60718293a4B5c6D7e8F9012345678';
const ADDR_B = '0xB1b2C3d4E5f60718293a4B5c6D7e8F9012345678';

const gestures = [
  {
    TimeStamp: T0,
    GestureType: 0,
    BidderAddr: ADDR_A,
    CstPriceEth: -1e-18,
    PrizeTime: T0 + 7_200,
    TxHash: '0xeth1',
  },
  {
    TimeStamp: T0 + 3_600,
    GestureType: 2,
    BidderAddr: ADDR_B,
    CstCost: 150,
    PrizeTime: T0 + 9_000,
    TxHash: '0xcst1',
  },
  {
    TimeStamp: T0 + 7_200,
    GestureType: 2,
    BidderAddr: ADDR_B,
    CstCost: 0,
    PrizeTime: T0 + 12_000,
    TxHash: '0xcst2',
  },
  {
    TimeStamp: T0 + 10_800,
    GestureType: 2,
    BidderAddr: ADDR_B,
    CstCost: 3_500,
    PrizeTime: T0 + 15_000,
    TxHash: '0xcst3',
  },
] as unknown as GestureInfo[];

const ethOnlyGestures = [
  {
    TimeStamp: T0,
    GestureType: 0,
    BidderAddr: ADDR_A,
    CstPriceEth: -1e-18,
    PrizeTime: T0 + 7_200,
  },
] as unknown as GestureInfo[];

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(okQuery(gestures));
});

describe('CstGestureCostView', () => {
  it('plots one point per CST gesture (ETH gestures only inform the clock)', () => {
    render(<CstGestureCostView gestures={gestures} />);

    expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-point-count', '3');
    expect(screen.getByTestId('cst-gesture-cost-chart')).toBeInTheDocument();
  });

  it('renders filled dots for paid gestures and a hollow dot for free ones', () => {
    const { container } = render(<CstGestureCostView gestures={gestures} />);

    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(3);
    expect(circles[0]).toHaveAttribute('fill', '#9C37FD');
    expect(circles[1]).toHaveAttribute('fill', 'none'); // free gesture, clamped to the floor
    expect(circles[2]).toHaveAttribute('fill', '#9C37FD');
  });

  it('shows the priciest / total / count summary', () => {
    render(<CstGestureCostView gestures={gestures} />);

    expect(screen.getByText(/^Priciest: 3500\.00 CST/)).toBeInTheDocument();
    expect(screen.getByText(/^Total consumed: 3650\.00 CST/)).toBeInTheDocument();
    expect(screen.getByText('3 CST gestures')).toBeInTheDocument();
  });

  it('shows CST paid, clock remaining, and the participant in the tooltip', () => {
    render(<CstGestureCostView gestures={gestures} />);

    expect(screen.getByText('CST paid')).toBeInTheDocument();
    expect(screen.getByText('150.00 CST')).toBeInTheDocument();
    // First CST gesture landed 3600s after the ETH gesture whose deadline was T0+7200.
    expect(screen.getByText('Clock remaining before')).toBeInTheDocument();
    expect(screen.getByText('1h')).toBeInTheDocument();
    expect(screen.getByText(/0xB1b2/)).toBeInTheDocument();
    expect(screen.getByText('Click the dot to open the transaction.')).toBeInTheDocument();
  });

  it('renders decade ticks on the log price axis', () => {
    render(<CstGestureCostView gestures={gestures} />);

    // Floor 150 → decades from 100 to 10k enclose [150, 3500].
    expect(screen.getByTestId('y-axis-cst')).toHaveTextContent('100 1k 10k');
  });

  it('formats the clock axis with duration ticks', () => {
    render(<CstGestureCostView gestures={gestures} />);

    expect(screen.getByTestId('y-axis-clock')).toHaveTextContent('0 30m 1h 1d 1.5d');
  });

  it('renders the legend and the mechanic explainer', () => {
    render(<CstGestureCostView gestures={gestures} />);

    expect(screen.getAllByText('CST paid per gesture').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Clock remaining before gesture').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/resets near twice the paid amount/)).toBeInTheDocument();
  });

  it('shows the empty state when the round has no CST gestures', () => {
    render(<CstGestureCostView gestures={ethOnlyGestures} />);

    expect(screen.getByText('No CST gestures in this round.')).toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<CstGestureCostView gestures={gestures} />);
    await checkA11y(container);
  });

  it('has no accessibility violations in the empty state', async () => {
    const { container } = render(<CstGestureCostView gestures={ethOnlyGestures} />);
    await checkA11y(container);
  });
});

describe('CstGestureCostChart', () => {
  it('asks the user to select a round when none is chosen', () => {
    render(<CstGestureCostChart round={-1} />);

    expect(screen.getByText('Select a round to inspect.')).toBeInTheDocument();
  });

  it('shows a spinner while the gesture list loads', () => {
    mockUseGestureListByCycle.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<CstGestureCostChart round={2} />);

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
    render(<CstGestureCostChart round={2} />);

    expect(screen.getByText('Failed to load CST gesture costs')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('fetches the round ascending', () => {
    render(<CstGestureCostChart round={2} />);

    expect(mockUseGestureListByCycle).toHaveBeenCalledWith(2, 'asc');
  });
});

describe('CstGestureCostSection round picker', () => {
  it('starts on the live round', () => {
    render(<CstGestureCostSection currentRoundNum={5} />);

    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(5);
    expect(screen.getByText('Live round')).toBeInTheDocument();
  });

  it('keeps a user-pinned round when the live round advances', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CstGestureCostSection currentRoundNum={5} />);

    await user.click(screen.getByRole('button', { name: 'Previous round' }));
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(4);

    rerender(<CstGestureCostSection currentRoundNum={6} />);
    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(4);
  });

  it('resumes following live after "Jump to live"', async () => {
    const user = userEvent.setup();
    render(<CstGestureCostSection currentRoundNum={5} />);

    await user.click(screen.getByRole('button', { name: 'Previous round' }));
    await user.click(screen.getByRole('button', { name: 'Jump to live' }));

    expect(screen.getByRole('spinbutton', { name: 'Round number' })).toHaveValue(5);
    expect(screen.getByText('Live round')).toBeInTheDocument();
  });
});
