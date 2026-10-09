import userEvent from '@testing-library/user-event';

import type { GestureInfo } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import CstCalibrationWindowChart, { CstCalibrationWindowView } from '../CstCalibrationWindowChart';
import { DOTS_MAX_POINTS } from '../charts/theme';

const mockUseGestureListByCycle = jest.fn();
const mockUseRoundInfo = jest.fn();
const mockUseCurrentTime = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));
jest.mock('../../../hooks/useNow', () => ({ useNow: () => NOW_SEC * 1000 }));
jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

const NOW_SEC = 1_700_000_000;
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

/** A chart's readout as [label, figure] rows, every space read as a plain one. */
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
  mockUseRoundInfo.mockReturnValue(ok(null));
  mockUseCurrentTime.mockReturnValue(ok(NOW_SEC));
});

describe('CstCalibrationWindowView', () => {
  it('plots one step per gesture plus the open-ended live point', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive nowTs={NOW_SEC} label="Window" />);
    expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-point-count', '4');
  });

  it('draws each gesture as a dot in its method colour, none for the live point', () => {
    const { container } = render(
      <CstCalibrationWindowView gestures={gestures} isLive nowTs={NOW_SEC} label="Window" />,
    );
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(3);
    expect(circles[0]).toHaveAttribute('fill', 'hsl(var(--method-eth))');
    expect(circles[1]).toHaveAttribute('fill', 'hsl(var(--method-eth-rwlk))');
    expect(circles[2]).toHaveAttribute('fill', 'hsl(var(--method-cst))');
  });

  it("leaves a dense cycle's step line unburied: no dots at rest, no dot key", () => {
    // Regression: ~1,100 gesture dots covered the line the legend promised.
    const dense = Array.from({ length: DOTS_MAX_POINTS + 1 }, (_, index) => ({
      TimeStamp: T0 + index * 60,
      GestureType: index % 2 === 0 ? 0 : 2,
      BidderAddr: ADDR_A,
      CstDutchAuctionDurationInt: 10_000 + (index % 2 === 0 ? -5 : 5),
    })) as unknown as GestureInfo[];
    const { container } = render(
      <CstCalibrationWindowView gestures={dense} isLive nowTs={NOW_SEC} label="Window" />,
    );
    expect(container.querySelectorAll('circle')).toHaveLength(0);
    const figure = screen.getByRole('figure', { name: 'Window' });
    expect(within(figure).getByText('CST Calibration Window')).toBeInTheDocument();
    expect(within(figure).queryByText('CST gesture (lengthens)')).not.toBeInTheDocument();
  });

  it('reads out the window now and its range as figures', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive nowTs={NOW_SEC} label="Window" />);
    const figure = screen.getByRole('figure', { name: 'Window' });
    expect(readoutOf(figure)).toEqual([
      ['Window now', '2h 46m 40s'],
      ['Shortest', '2h 46m'],
      ['Longest', '2h 46m 40s'],
    ]);
  });

  it('reads out the closing value of a finalized cycle', () => {
    render(
      <CstCalibrationWindowView
        gestures={gestures}
        isLive={false}
        endTs={T0 + 9_000}
        label="Window"
      />,
    );
    const [closing] = readoutOf(screen.getByRole('figure', { name: 'Window' }));
    expect(closing![0]).toBe('Window at finalization');
  });

  it('puts whole-minute ticks on a narrow window axis, each reading differently', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive nowTs={NOW_SEC} label="Window" />);
    const ticks = within(screen.getByTestId('y-axis'))
      .getAllByText(/./)
      .map((el) => el.textContent);
    expect(ticks.length).toBeGreaterThan(1);
    // 9,960s–10,000s: minute steps past the hour read "2h 46m", never "2.8h" twice.
    for (const tick of ticks) expect(tick).toMatch(/^\d+h\s\d+m$/);
    expect(new Set(ticks).size).toBe(ticks.length);
  });

  it('names the gesture and participant in the tooltip, and every method in the legend', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive nowTs={NOW_SEC} label="Window" />);
    expect(screen.getByText('Window after this gesture')).toBeInTheDocument();
    expect(screen.getAllByText('ETH gesture (shortens)').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('ETH + Random Walk gesture (shortens)')).toBeInTheDocument();
    expect(screen.getByText('CST gesture (lengthens)')).toBeInTheDocument();
    expect(screen.getByText(/0xa1B2…⁠5678/)).toBeInTheDocument();
  });

  it('lists every gesture as a table on request', async () => {
    const user = userEvent.setup();
    render(<CstCalibrationWindowView gestures={gestures} isLive nowTs={NOW_SEC} label="Window" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Window' });
    expect(within(table).getAllByRole('row')).toHaveLength(4);
  });

  it('explains cycles indexed before the window data existed', () => {
    render(
      <CstCalibrationWindowView gestures={legacyGestures} isLive nowTs={NOW_SEC} label="Window" />,
    );
    expect(screen.getByText(/No per-gesture Calibration Window data/)).toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CstCalibrationWindowView gestures={gestures} isLive nowTs={NOW_SEC} label="Window" />,
    );
    await checkA11y(container);
  });
});

describe('CstCalibrationWindowChart', () => {
  it('asks for a cycle when none is chosen', () => {
    render(<CstCalibrationWindowChart round={-1} isLive={false} label="Window" />);
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
    render(<CstCalibrationWindowChart round={2} isLive label="Window" />);
    expect(screen.getByText('Failed to load Calibration Window timeline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('ends a finalized cycle at its finalization time', () => {
    mockUseRoundInfo.mockReturnValue(ok({ TimeStamp: T0 + 9_000 }));
    render(<CstCalibrationWindowChart round={1} isLive={false} label="Window" />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(1);
    expect(screen.getByRole('figure', { name: 'Window' })).toHaveTextContent(/at finalization/);
  });

  it('says a cycle without gestures has no window data, without waiting on its end', () => {
    mockUseGestureListByCycle.mockReturnValue(ok([]));
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<CstCalibrationWindowChart round={7} isLive={false} label="Window" />);
    expect(
      screen.queryByText('Failed to load Calibration Window timeline'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/No per-gesture Calibration Window data/)).toBeInTheDocument();
  });

  it('waits for a finalized cycle’s end, and offers a retry when it cannot be read', async () => {
    const user = userEvent.setup();
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { rerender } = render(
      <CstCalibrationWindowChart round={1} isLive={false} label="Window" />,
    );
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
    const refetch = jest.fn();
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    rerender(<CstCalibrationWindowChart round={1} isLive={false} label="Window" />);
    expect(screen.getByText('Failed to load Calibration Window timeline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
