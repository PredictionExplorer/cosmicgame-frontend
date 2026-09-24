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

/** A summary line by its whole text: the address inside it is a link of its own. */
const summaryLine = (pattern: RegExp) => (_: string, element: Element | null) =>
  element?.tagName === 'SPAN' &&
  element.classList.contains('block') &&
  pattern.test(element.textContent ?? '');

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
    expect(
      within(figure).getByText(summaryLine(/^Endurance Champion: 0xb1b2….*held 1[67]h/i)),
    ).toBeInTheDocument();
    expect(within(figure).getByText(summaryLine(/^Chrono-Warrior: /))).toBeInTheDocument();
  });

  it('lays the time axis and every lane on the same columns, so they cannot drift apart', () => {
    // Regression: on phones the axis spacer was w-36 while the lane labels were w-24, so the
    // ticks sat 48px right of the bars they labelled.
    const { container } = render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    const axis = container.querySelector('[aria-hidden="true"].grid');
    const columns = (element: Element | null) =>
      [...(element?.classList ?? [])].filter((name) => name.startsWith('grid-cols-'));
    expect(columns(axis)).toHaveLength(1);
    for (const lane of within(gantt).getAllByRole('group')) {
      expect(columns(lane)).toEqual(columns(axis));
    }
  });

  it('draws a lane per address with its title spelled out for assistive technology', () => {
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    const lanes = within(gantt).getAllByRole('group');
    expect(lanes).toHaveLength(2);
    expect(within(gantt).getAllByText('Endurance Champion', { selector: '.sr-only' })).toHaveLength(
      1,
    );
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
    const firstReadout = readout.textContent;
    // Each lane holds two stints: End moves focus to the lane's last one.
    await user.keyboard('{End}');
    expect(stints[1]).toHaveFocus();
    expect(stints[1]).toHaveAttribute('tabindex', '0');
    expect(stints.filter((stint) => stint.tabIndex === 0)).toHaveLength(1);
    expect(readout.textContent).not.toBe(firstReadout);
    await user.keyboard('{Home}');
    expect(stints[0]).toHaveFocus();
  });

  it('draws the focused stint ring outside the stint, on a lane that does not clip it', () => {
    // Regression: an inset ring on a 2-3px stint showed as a 1px sliver (WCAG 2.4.7).
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    for (const stint of within(gantt).getAllByRole('img')) {
      expect(stint).not.toHaveClass('focus-ring-inset');
      expect(stint).toHaveClass('focus-visible:outline-solid', 'focus-visible:z-10');
      expect(stint.parentElement).not.toHaveClass('overflow-hidden');
      expect(stint.style.getPropertyValue('--mark-at')).toMatch(/%$/);
    }
    for (const lane of within(gantt).getAllByRole('group')) {
      expect(lane.className).toContain('has-[[role=img]:focus-visible]:bg-surface');
    }
  });

  it('links each summary address to its participant, in the identifier face', () => {
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const figure = screen.getByRole('figure', { name: 'Endurance' });
    const caption = figure.querySelector('figcaption')!;
    const links = within(caption).getAllByRole('link');
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveClass('type-mono');
      expect(link.getAttribute('href')).toMatch(/^\/user\/0x/);
    }
  });

  it('shows the longest holders first and the rest behind "Show all", never in a scroll box', async () => {
    // Regression: lanes past 14 hid in a nested scroll area whose mask made the 14th look last.
    const user = userEvent.setup();
    const many = Array.from({ length: 16 }, (_, index) => ({
      TimeStamp: T0 + index * HOUR,
      BidderAddr: `0x${(index + 1).toString(16).padStart(40, '0')}`,
    }));
    mockUseGestureListByCycle.mockReturnValue(ok(many));
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    expect(within(gantt).getAllByRole('group')).toHaveLength(14);
    expect(gantt.closest('[class*="overflow-y-auto"]')).toBeNull();
    expect(screen.getByText('Showing 14 of 16 addresses that held the lead')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show all 16' }));
    expect(within(gantt).getAllByRole('group')).toHaveLength(16);
    expect(screen.getByRole('button', { name: 'Show the top 14' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('draws every lane when the page asks for all of them', () => {
    const many = Array.from({ length: 16 }, (_, index) => ({
      TimeStamp: T0 + index * HOUR,
      BidderAddr: `0x${(index + 1).toString(16).padStart(40, '0')}`,
    }));
    mockUseGestureListByCycle.mockReturnValue(ok(many));
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" laneLimit={null} />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    expect(within(gantt).getAllByRole('group')).toHaveLength(16);
    expect(screen.queryByRole('button', { name: /^Show all/ })).not.toBeInTheDocument();
  });

  it('pins a tapped stint in the readout, since a finger has no hover', async () => {
    const user = userEvent.setup();
    const { container } = render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    const readout = container.querySelector('[aria-live="polite"]')!;
    const stint = within(gantt).getAllByRole('img')[1]!;
    await user.click(stint);
    await user.unhover(gantt);
    expect(readout.textContent).toBe(stint.getAttribute('aria-label'));
  });

  it('holds the Gantt shape at the expected lane count while the gestures load', () => {
    mockUseGestureListByCycle.mockReturnValue({ ...ok(undefined), isLoading: true });
    const { container } = render(
      <EnduranceTimelineChart round={2} isLive label="Endurance" expectedLanes={19} />,
    );
    const status = screen.getByRole('status', { name: /loading/i });
    expect(status.querySelectorAll('.bg-surface-sunken')).toHaveLength(19);
    // The caption's two lines are held too, so the view switch below does not move.
    expect(container.querySelector('figcaption')).toBeInTheDocument();
  });

  it('switches to the records as lines', async () => {
    const user = userEvent.setup();
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    await user.click(screen.getByRole('tab', { name: 'Line chart' }));
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByText('Endurance Champion record')).toBeInTheDocument();
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
    expect(
      screen.getByText(summaryLine(/^Endurance Champion: 0xa1b2….*held 10h/i)),
    ).toBeInTheDocument();
  });

  it('asks for a cycle, and says when the cycle has no lead yet', () => {
    const { rerender } = render(
      <EnduranceTimelineChart round={-1} isLive={false} label="Endurance" />,
    );
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
