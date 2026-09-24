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
  it('plots one point per CST gesture and reads the cycle in one sentence', () => {
    render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-point-count', '3');
    const figure = screen.getByRole('figure', { name: 'CST cost' });
    expect(figure).toHaveTextContent(
      /consumed 3,650(\.00)? CST\. The highest cost was 3,500(\.00)? CST/,
    );
  });

  it('says when the highest cost came as a duration, not an axis tick', () => {
    // Regression: the summary read "10.5d into the cycle".
    const late = gestures.map((gesture, index) =>
      index === 3 ? { ...gesture, TimeStamp: T0 + 10.5 * 86_400 } : gesture,
    ) as GestureInfo[];
    render(<CstGestureCostView gestures={late} label="CST cost" />);
    expect(screen.getByRole('figure', { name: 'CST cost' })).toHaveTextContent(
      /3,500(\.00)? CST, 10d 12h into the cycle\./,
    );
  });

  it('draws a hollow dot for a gesture that cost nothing', () => {
    const { container } = render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    const fills = Array.from(container.querySelectorAll('circle')).map((c) =>
      c.getAttribute('fill'),
    );
    expect(fills).toEqual(['hsl(var(--method-cst))', 'none', 'hsl(var(--method-cst))']);
  });

  it('labels the price axis in decades and the clock axis in whole units', () => {
    render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    const [price, clock] = screen.getAllByTestId('y-axis');
    expect(within(price!).getByText('1,000')).toBeInTheDocument();
    for (const tick of within(clock!).getAllByText(/./)) {
      expect(tick.textContent).toMatch(/^(0|\d+(m|h|d)(\s\d+m)?)$/);
    }
  });

  it('keys the clock as a dashed reference line in the legend', () => {
    render(<CstGestureCostView gestures={gestures} label="CST cost" />);
    expect(screen.getByText('CST paid per gesture')).toBeInTheDocument();
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
    expect(screen.getByText('Failed to load CST gesture costs')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
