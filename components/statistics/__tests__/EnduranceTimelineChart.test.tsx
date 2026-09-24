import userEvent from '@testing-library/user-event';

import { act, checkA11y, render, screen, within } from '@/test-utils';

import EnduranceTimelineChart from '../EnduranceTimelineChart';

const mockUseGestureListByCycle = jest.fn();
const mockUseRoundInfo = jest.fn();
const mockUseCurrentTime = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
}));
jest.mock('../../../hooks/useNow', () => ({ useNow: () => END * 1000 }));
jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

const HOUR = 3_600;
const T0 = 1_700_000_000;
const END = T0 + 30 * HOUR;
const ALICE = '0xA1b2C3d4E5f60718293a4B5c6D7e8F9012345678';
const BOB = '0xB1b2C3d4E5f60718293a4B5c6D7e8F9012345678';

// Alice leads 10h, Bob 2h, Alice 1h, then Bob holds to "now" (17h).
const gestures = [
  { TimeStamp: T0, BidderAddr: ALICE },
  { TimeStamp: T0 + 10 * HOUR, BidderAddr: BOB },
  { TimeStamp: T0 + 12 * HOUR, BidderAddr: ALICE },
  { TimeStamp: T0 + 13 * HOUR, BidderAddr: BOB },
];

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(ok(gestures));
  mockUseRoundInfo.mockReturnValue(ok(null));
  mockUseCurrentTime.mockReturnValue(ok(END));
});

describe('EnduranceTimelineChart', () => {
  it('names the Endurance Champion and the Chrono-Warrior, one line each', () => {
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const figure = screen.getByRole('figure', { name: 'Endurance' });
    expect(within(figure).getByText(/^Endurance champion: 0xb1b2….*held 1[67]h/i)).toBeInTheDocument();
    expect(within(figure).getByText(/^Chrono-warrior: /)).toBeInTheDocument();
  });

  it('draws a lane per address with its title spelled out for assistive technology', () => {
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    const lanes = within(gantt).getAllByRole('group');
    expect(lanes).toHaveLength(2);
    expect(within(gantt).getAllByText('Endurance Champion', { selector: '.sr-only' })).toHaveLength(1);
  });

  it('keeps one tab stop across every stint and reads the focused one out', async () => {
    const user = userEvent.setup();
    const { container } = render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    const stints = within(gantt).getAllByRole('img');
    expect(stints).toHaveLength(4);
    expect(stints.filter((stint) => stint.tabIndex === 0)).toHaveLength(1);

    act(() => stints[0]!.focus());
    const readout = container.querySelector('[aria-live="polite"]')!;
    expect(readout).toHaveTextContent(/^0x[ab]1b2….*held/i);
    await user.keyboard('{End}');
    expect(stints.filter((stint) => stint.tabIndex === 0)).toHaveLength(1);
  });

  it('switches to the records as lines', async () => {
    const user = userEvent.setup();
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    await user.click(screen.getByRole('tab', { name: 'Line chart' }));
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByText('Endurance champion record')).toBeInTheDocument();
  });

  it('lists every address that held the lead as a table', async () => {
    const user = userEvent.setup();
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Endurance' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getByText(/Endurance Champion/)).toBeInTheDocument();
  });

  it('ends a finalized cycle at its finalization time', () => {
    mockUseRoundInfo.mockReturnValue(ok({ TimeStamp: T0 + 20 * HOUR }));
    render(<EnduranceTimelineChart round={1} isLive={false} label="Endurance" />);
    expect(mockUseRoundInfo).toHaveBeenCalledWith(1);
    // Bob's last stint now runs 7h, under Alice's 10h opening hold.
    expect(screen.getByText(/^Endurance champion: 0xa1b2….*held 10h/i)).toBeInTheDocument();
  });

  it('asks for a cycle, and says when the cycle has no lead yet', () => {
    const { rerender } = render(<EnduranceTimelineChart round={-1} isLive={false} label="Endurance" />);
    expect(screen.getByText('Select a cycle to inspect.')).toBeInTheDocument();
    mockUseGestureListByCycle.mockReturnValue(ok([]));
    rerender(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    expect(screen.getByText('No lead activity in this cycle yet.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    await checkA11y(container);
  });
});
