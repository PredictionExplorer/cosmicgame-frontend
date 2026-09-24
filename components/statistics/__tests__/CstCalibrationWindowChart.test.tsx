import userEvent from '@testing-library/user-event';

import type { GestureInfo } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import CstCalibrationWindowChart, { CstCalibrationWindowView } from '../CstCalibrationWindowChart';

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

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(ok(gestures));
  mockUseRoundInfo.mockReturnValue(ok(null));
  mockUseCurrentTime.mockReturnValue(ok(NOW_SEC));
});

describe('CstCalibrationWindowView', () => {
  it('plots one step per gesture plus the open-ended live point', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive label="Window" />);
    expect(screen.getByTestId('composed-chart')).toHaveAttribute('data-point-count', '4');
  });

  it('draws each gesture as a dot in its method colour, none for the live point', () => {
    const { container } = render(
      <CstCalibrationWindowView gestures={gestures} isLive label="Window" />,
    );
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(3);
    expect(circles[0]).toHaveAttribute('fill', 'hsl(var(--method-eth))');
    expect(circles[1]).toHaveAttribute('fill', 'hsl(var(--method-eth-rwlk))');
    expect(circles[2]).toHaveAttribute('fill', 'hsl(var(--method-cst))');
  });

  it('reads the window now and its range in one sentence', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive label="Window" />);
    const figure = screen.getByRole('figure', { name: 'Window' });
    expect(figure).toHaveTextContent(
      /The window is .* now\. This cycle it has ranged from .* to .*\./,
    );
  });

  it('reads the closing value of a finalized cycle', () => {
    render(
      <CstCalibrationWindowView
        gestures={gestures}
        isLive={false}
        roundEndTs={T0 + 9_000}
        label="Window"
      />,
    );
    expect(screen.getByRole('figure', { name: 'Window' })).toHaveTextContent(
      /The window was .* at finalization\./,
    );
  });

  it('puts whole-minute ticks on a narrow window axis, each reading differently', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive label="Window" />);
    const ticks = within(screen.getByTestId('y-axis'))
      .getAllByText(/./)
      .map((el) => el.textContent);
    expect(ticks.length).toBeGreaterThan(1);
    // 9,960s–10,000s: minute steps past the hour read "2h 46m", never "2.8h" twice.
    for (const tick of ticks) expect(tick).toMatch(/^\d+h\s\d+m$/);
    expect(new Set(ticks).size).toBe(ticks.length);
  });

  it('names the gesture and participant in the tooltip, and every method in the legend', () => {
    render(<CstCalibrationWindowView gestures={gestures} isLive label="Window" />);
    expect(screen.getByText('Window after this gesture')).toBeInTheDocument();
    expect(screen.getAllByText('ETH gesture (shortens)').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('ETH + Random Walk gesture (shortens)')).toBeInTheDocument();
    expect(screen.getByText('CST gesture (lengthens)')).toBeInTheDocument();
    expect(screen.getByText(/0xa1B2…⁠5678/)).toBeInTheDocument();
  });

  it('lists every gesture as a table on request', async () => {
    const user = userEvent.setup();
    render(<CstCalibrationWindowView gestures={gestures} isLive label="Window" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Window' });
    expect(within(table).getAllByRole('row')).toHaveLength(4);
  });

  it('explains cycles indexed before the window data existed', () => {
    render(<CstCalibrationWindowView gestures={legacyGestures} isLive label="Window" />);
    expect(screen.getByText(/No per-gesture Calibration Window data/)).toBeInTheDocument();
    expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CstCalibrationWindowView gestures={gestures} isLive label="Window" />,
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
});
