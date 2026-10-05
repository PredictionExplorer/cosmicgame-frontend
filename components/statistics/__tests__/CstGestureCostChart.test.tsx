import userEvent from '@testing-library/user-event';

import type { GestureInfo } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import CstGestureCostChart, { CstGestureCostView, decadeTicks } from '../CstGestureCostChart';

const mockUseGestureListByCycle = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
}));
jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

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

const ethOnly = [gestures[0]!] as GestureInfo[];

/** A chart's readout as [label, figure, caption] rows, every space read as a plain one. */
const readoutOf = (figure: Element) =>
  [...figure.querySelectorAll('figcaption dl > div')].map((item) =>
    [...item.querySelectorAll('dt, dd')].map((cell) =>
      (cell.textContent ?? '').replace(/\s/g, ' '),
    ),
  );

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(ok(gestures));
});

describe('decadeTicks', () => {
  it('encloses the paid range in powers of ten', () => {
    expect(decadeTicks(0.5, 3_500)).toEqual([0.1, 1, 10, 100, 1_000, 10_000]);
  });
});

describe('CstGestureCostView', () => {
  it('plots cost and clock as two panels on one time axis, and reads the cycle out', () => {
    render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    // V301: the clock has its own panel under the cost, not a second scale on the same plot.
    const panels = screen.getAllByTestId('composed-chart');
    expect(panels).toHaveLength(2);
    for (const panel of panels) expect(panel).toHaveAttribute('data-point-count', '3');
    expect(readoutOf(screen.getByRole('figure', { name: 'CST cost' }))).toEqual([
      ['CST gestures', '3'],
      ['CST consumed', expect.stringMatching(/^3,650(\.00)? CST$/)],
      ['Highest cost', expect.stringMatching(/^3,500(\.00)? CST$/), expect.any(String)],
    ]);
  });

  it('says when the highest cost came as a duration, not an axis tick', () => {
    // Regression: the summary read "10.5d into the cycle".
    const late = gestures.map((gesture, index) =>
      index === 3 ? { ...gesture, TimeStamp: T0 + 10.5 * 86_400 } : gesture,
    ) as GestureInfo[];
    render(<CstGestureCostView gestures={late} label="CST cost" />);
    const highest = readoutOf(screen.getByRole('figure', { name: 'CST cost' })).at(-1)!;
    expect(highest[2]).toBe('10d 12h into cycle');
  });

  it('draws a free gesture as an open ring, at least 4px across like every dot', () => {
    const { container } = render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    const dots = Array.from(container.querySelectorAll('circle'));
    expect(dots.map((c) => c.getAttribute('fill'))).toEqual([
      'hsl(var(--method-cst))',
      'hsl(var(--background))',
      'hsl(var(--method-cst))',
    ]);
    expect(dots[1]).toHaveAttribute('stroke-width', '1.5');
    for (const dot of dots) expect(Number(dot.getAttribute('r'))).toBeGreaterThanOrEqual(2);
  });

  it('labels the price axis in decades and the clock axis in whole units', () => {
    render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    const [price, clock] = screen.getAllByTestId('y-axis');
    expect(within(price!).getByText('1,000')).toBeInTheDocument();
    for (const tick of within(clock!).getAllByText(/./)) {
      expect(tick.textContent).toMatch(/^(0|\d+(m|h|d)(\s\d+m)?)$/);
    }
  });

  it('keys the paid dots, the free rings and the clock in the legend', () => {
    render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    expect(screen.getByText('CST paid per gesture')).toBeInTheDocument();
    expect(screen.getByText('Free gesture')).toBeInTheDocument();
    expect(screen.getByText('Clock remaining before gesture')).toBeInTheDocument();
  });

  it('lists every CST gesture as a table, newest first', async () => {
    const user = userEvent.setup();
    render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const rows = within(screen.getByRole('table', { name: 'CST cost' })).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(rows[1]).toHaveTextContent('3,500');
  });

  it('says so when the cycle had no CST gestures', () => {
    render(<CstGestureCostView gestures={ethOnly} label="CST cost" />);
    expect(screen.getByText('No CST gestures in this cycle.')).toBeInTheDocument();
  });

  it('opens a cycle of fewer than three CST gestures on its table, not a near-empty plot', async () => {
    // Regression: one CST gesture drew a 1,000–10,000 log plot with a single dot at its edge.
    const user = userEvent.setup();
    render(<CstGestureCostView gestures={gestures.slice(0, 2)} label="CST cost" />);
    expect(screen.getByRole('table', { name: 'CST cost' })).toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'View as table' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(screen.getAllByTestId('composed-chart')).toHaveLength(2);
  });

  it('draws smaller dots on a phone, where a joined run merges into a band', () => {
    // jsdom has no matchMedia: the chart takes the narrow screen.
    const { container } = render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    for (const dot of container.querySelectorAll('circle')) {
      expect(dot).toHaveAttribute('r', '2');
    }
  });

  it('keeps full dots on a wide screen with a short series', () => {
    const matchMedia = jest.fn((query: string) => ({
      matches: query === '(min-width: 640px)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });
    try {
      const { container } = render(<CstGestureCostView gestures={gestures} label="CST cost" />);
      for (const dot of container.querySelectorAll('circle')) {
        expect(dot).toHaveAttribute('r', '3');
      }
    } finally {
      delete (window as { matchMedia?: unknown }).matchMedia;
    }
  });

  it('has no axe violations', async () => {
    const { container } = render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    await checkA11y(container);
  });
});

describe('CstGestureCostChart', () => {
  it('asks for a cycle when none is chosen', () => {
    render(<CstGestureCostChart round={-1} label="CST cost" />);
    expect(screen.getByText('Select a cycle to inspect.')).toBeInTheDocument();
  });

  it('offers a retry when the gesture list fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseGestureListByCycle.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<CstGestureCostChart round={2} label="CST cost" />);
    expect(screen.getByText('Failed to load CST Gesture Costs')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
