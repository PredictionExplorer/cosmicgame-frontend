import userEvent from '@testing-library/user-event';

import { lastChartData } from '@/test-utils/recharts';

import { checkA11y, render, screen, within } from '@/test-utils';

import { GestureTypeMixChart } from '../GestureTypeMixChart';

const mockUseGestureListByCycle = jest.fn();
const mockUseRoundInfo = jest.fn();
const mockUseCurrentTime = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));
jest.mock('../../../hooks/useNow', () => ({ useNow: () => NOW * 1000 }));
jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

const HOUR = 3_600;
const T0 = Date.UTC(2026, 7, 12) / 1000;
const NOW = T0 + 20 * HOUR;

const gestures = [
  { TimeStamp: T0 + 60, GestureType: 0 },
  { TimeStamp: T0 + 120, GestureType: 0 },
  { TimeStamp: T0 + 2 * HOUR, GestureType: 1 },
  { TimeStamp: T0 + 5 * HOUR, GestureType: 2 },
];

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(ok(gestures));
  mockUseRoundInfo.mockReturnValue(ok(null));
  mockUseCurrentTime.mockReturnValue(ok(NOW));
});

describe('GestureTypeMixChart', () => {
  it('reads out the cycle’s method mix in counts and shares, each with its colour', () => {
    render(<GestureTypeMixChart round={2} isLive label="Gesture type distribution" />);
    const figure = screen.getByRole('figure', { name: 'Gesture type distribution' });
    const figures = [...figure.querySelectorAll('figcaption dl > div')].map((item) =>
      [...item.querySelectorAll('dt, dd')].map((cell) => cell.textContent),
    );
    expect(figures).toEqual([
      ['Gestures', '4'],
      ['ETH', '2', '50%'],
      ['ETH with Random Walk NFT', '1', '25%'],
      ['CST', '1', '25%'],
    ]);
  });

  it('counts the live cycle’s gestures made since the last whole hour', () => {
    // V107: at 20:35 the gesture at 20:10 is in the bars, as it is in the readout.
    const late = T0 + 20 * HOUR + 10 * 60;
    mockUseGestureListByCycle.mockReturnValue(
      ok([...gestures, { TimeStamp: late, GestureType: 2 }]),
    );
    mockUseCurrentTime.mockReturnValue(ok(T0 + 20 * HOUR + 35 * 60));
    render(<GestureTypeMixChart round={2} isLive label="Mix" />);
    const bars = lastChartData<{ total: number }>();
    expect(bars.reduce((sum, bar) => sum + bar.total, 0)).toBe(5);
    expect(bars.at(-1)!.total).toBe(1);
  });

  it('waits for a finalized cycle’s end before drawing it', () => {
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<GestureTypeMixChart round={1} isLive={false} label="Mix" />);
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('stacks counts per window, hourly for a young cycle, empty windows included', () => {
    render(<GestureTypeMixChart round={2} isLive label="Mix" />);
    const intervals = within(screen.getByRole('radiogroup', { name: 'Sample every' })).getAllByRole(
      'radio',
    );
    expect(intervals.map((radio) => radio.closest('label')?.textContent)).toEqual([
      '1h',
      '6h',
      '12h',
      '1d',
    ]);
    expect(intervals[0]).toBeChecked();
    // Twenty hours at one-hour windows, the empty ones kept.
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-point-count', '21');
  });

  it('coarsens the windows when a reader picks another interval', async () => {
    const user = userEvent.setup();
    render(<GestureTypeMixChart round={2} isLive label="Mix" />);
    await user.click(screen.getAllByRole('radio')[1]!);
    expect(Number(screen.getByTestId('bar-chart').getAttribute('data-point-count'))).toBeLessThan(
      21,
    );
  });

  it('lists the non-empty windows as a table', async () => {
    const user = userEvent.setup();
    render(<GestureTypeMixChart round={2} isLive label="Mix" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const rows = within(screen.getByRole('table', { name: 'Mix' })).getAllByRole('row');
    expect(rows).toHaveLength(4);
  });

  it('says so when the cycle has no gestures yet, in words for any cycle', () => {
    mockUseGestureListByCycle.mockReturnValue(ok([]));
    render(<GestureTypeMixChart round={2} isLive label="Mix" />);
    // V115: the chart follows the page's cycle picker, so never "the current cycle".
    expect(screen.getByText('No gestures in this cycle yet.')).toBeInTheDocument();
  });

  it('names the cycle it could not read without calling it the current one', () => {
    mockUseGestureListByCycle.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    render(<GestureTypeMixChart round={1} isLive={false} label="Mix" />);
    expect(
      screen.getByText('Could not fetch the gesture history for this cycle.'),
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<GestureTypeMixChart round={2} isLive label="Mix" />);
    await checkA11y(container);
  });
});
