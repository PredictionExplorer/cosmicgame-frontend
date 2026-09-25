import userEvent from '@testing-library/user-event';

import { act, checkA11y, render, screen, within } from '@/test-utils';

import EnduranceTimelineChart from '../EnduranceTimelineChart';
import { ChartLinksOpenNewWindow } from '../charts/timeline';

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

/** A chart's readout as [label, figure, caption] rows. */
const readoutOf = (figure: Element) =>
  [...figure.querySelectorAll('figcaption dl > div')].map((item) =>
    [...item.querySelectorAll('dt, dd')].map((cell) => cell.textContent ?? ''),
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUseGestureListByCycle.mockReturnValue(ok(gestures));
  mockUseRoundInfo.mockReturnValue(ok(null));
  mockUseCurrentTime.mockReturnValue(ok(END));
});

describe('EnduranceTimelineChart', () => {
  it('reads out the Endurance Champion, the Chrono-Warrior and the lanes as figures', () => {
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const figure = screen.getByRole('figure', { name: 'Endurance' });
    const figures = readoutOf(figure);
    expect(figures.map(([label]) => label)).toEqual([
      'Endurance Champion',
      'Chrono-Warrior',
      'Addresses in the lead',
    ]);
    expect(figures[0]![1]).toMatch(/^1[67]h/);
    expect(figures[0]![2]).toMatch(/^0xb1b2…/i);
    expect(figures[2]![1]).toBe('2');
  });

  it('pins the record’s callout over its stint, drawn never thinner than 6px', () => {
    render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    const gantt = screen.getByRole('group', { name: 'Lead stints by participant' });
    const record = within(gantt)
      .getAllByRole('img')
      .find((stint) => /Endurance Champion/.test(stint.getAttribute('aria-label') ?? ''))!;
    expect(record).toHaveClass('[--mark-min:6px]');
    expect(within(gantt).getByText(/^Endurance record · 1[67]h/)).toBeInTheDocument();
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
    // V301: the title is spelled out beside its legend swatch, not abbreviated to "EC".
    expect(within(gantt).getAllByText('Endurance Champion')).toHaveLength(1);
    expect(within(gantt).queryByText('EC')).not.toBeInTheDocument();
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
      expect(link).not.toHaveAttribute('target');
    }
  });

  it('opens its participants in a new window inside an embed, and says so', async () => {
    // Regression: the embed's summary addresses turned the embed window into the app,
    // while its own source link opened a new window.
    const user = userEvent.setup();
    render(
      <ChartLinksOpenNewWindow>
        <EnduranceTimelineChart round={2} isLive label="Endurance" />
      </ChartLinksOpenNewWindow>,
    );
    const caption = screen.getByRole('figure', { name: 'Endurance' }).querySelector('figcaption')!;
    await user.click(screen.getByRole('button', { name: 'View as table' }));
    const table = screen.getByRole('table', { name: 'Endurance' });
    const links = [...within(caption).getAllByRole('link'), ...within(table).getAllByRole('link')];
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAccessibleName(/\(opens in a new window\)$/);
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
    // Every lane is in view: the caption says so rather than "Showing 16 of 16".
    expect(screen.getByText('Showing all 16 addresses that held the lead')).toBeInTheDocument();
    expect(screen.queryByText(/Showing 16 of 16/)).not.toBeInTheDocument();
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
    const { container, rerender } = render(
      <EnduranceTimelineChart
        round={2}
        isLive
        label="Endurance"
        expectedLanes={19}
        laneLimit={null}
      />,
    );
    const lanes = () =>
      screen.getByRole('status', { name: /loading/i }).querySelectorAll('.bg-surface-sunken');
    expect(lanes()).toHaveLength(19);
    // The readout's figures are held too, so the view switch below does not move.
    expect(readoutOf(container.querySelector('figure')!)).toHaveLength(3);
    // A page that shows 14 lanes before "Show all" holds 14.
    rerender(<EnduranceTimelineChart round={2} isLive label="Endurance" expectedLanes={19} />);
    expect(lanes()).toHaveLength(14);
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
    const [champion] = readoutOf(screen.getByRole('figure', { name: 'Endurance' }));
    expect(champion).toEqual(['Endurance Champion', '10h', expect.stringMatching(/^0xa1b2…/i)]);
  });

  it('names no champion before a finalized cycle’s end is known', () => {
    // V108: without the end, the last holder's stint is missing and the record may be wrong.
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<EnduranceTimelineChart round={1} isLive={false} label="Endurance" />);
    const figure = screen.getByRole('figure', { name: 'Endurance' });
    expect(readoutOf(figure).every((item) => item.length === 1 || item[1] === '')).toBe(true);
    expect(screen.queryByRole('group', { name: 'Lead stints by participant' })).toBeNull();
  });

  it('says so, with a retry, when a finalized cycle’s end cannot be read', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<EnduranceTimelineChart round={1} isLive={false} label="Endurance" />);
    expect(screen.getByText('Failed to load endurance timeline')).toBeInTheDocument();
    expect(screen.queryByText(/Endurance record/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalled();
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

  it('says a finalized cycle without gestures had no lead, without waiting on its end', () => {
    // Regression: the empty embed of a past cycle showed an error when its end could not be
    // read, although a cycle without gestures has no lead whenever it ended.
    mockUseGestureListByCycle.mockReturnValue(ok([]));
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    const { rerender } = render(
      <EnduranceTimelineChart round={7} isLive={false} label="Endurance" />,
    );
    expect(screen.getByText('No lead activity in this cycle yet.')).toBeInTheDocument();
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    rerender(<EnduranceTimelineChart round={7} isLive={false} label="Endurance" />);
    expect(screen.getByText('No lead activity in this cycle yet.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<EnduranceTimelineChart round={2} isLive label="Endurance" />);
    await checkA11y(container);
  });
});
