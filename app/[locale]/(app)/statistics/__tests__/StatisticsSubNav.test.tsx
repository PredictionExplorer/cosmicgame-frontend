import statisticsMessages from '@/messages/en/statistics.json';

import { render, screen, checkA11y } from '@/test-utils';

import { StatisticsSubNav, centerActiveItem, scrollEdges } from '../StatisticsSubNav';
import { ALL_STATISTICS_SECTIONS } from '../statistics-sections';

let mockPathname = '/statistics';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe('StatisticsSubNav', () => {
  it('renders one link per statistics section', () => {
    mockPathname = '/statistics';
    render(<StatisticsSubNav />);
    const nav = screen.getByRole('navigation', { name: 'Statistics sections' });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(ALL_STATISTICS_SECTIONS.length);
    for (const section of ALL_STATISTICS_SECTIONS) {
      expect(
        screen.getByRole('link', {
          name: statisticsMessages.navigation[section.messageKey].label,
        }),
      ).toHaveAttribute('href', section.href);
    }
  });

  it('marks the hub as current only on the exact hub path', () => {
    mockPathname = '/statistics';
    render(<StatisticsSubNav />);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Tokens' })).not.toHaveAttribute('aria-current');
  });

  it('marks a section page as current on its path', () => {
    mockPathname = '/statistics/anchoring';
    render(<StatisticsSubNav />);
    expect(screen.getByRole('link', { name: 'Anchoring' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
  });

  it('has no accessibility violations', async () => {
    mockPathname = '/statistics';
    const { container } = render(<StatisticsSubNav />);
    await checkA11y(container);
  });
});

describe('centerActiveItem', () => {
  /**
   * A scroller and an item with the layout jsdom does not compute. The
   * scroller starts `inset` px from its offset parent (the sticky wrapper),
   * which `offsetLeft` would wrongly count.
   */
  function layout(item: { left: number; width: number }, inset = 28, scrollLeft = 0) {
    const scroller = {
      clientWidth: 360,
      clientLeft: 0,
      scrollWidth: 900,
      scrollLeft,
      getBoundingClientRect: () => ({ left: inset }),
    } as unknown as HTMLElement;
    const element = {
      // Viewport position: the scroller's inset plus the item's place in the row,
      // minus how far the row is scrolled.
      getBoundingClientRect: () => ({ left: inset + item.left - scrollLeft, width: item.width }),
    } as unknown as HTMLElement;
    return { scroller, item: element };
  }

  it('scrolls a later section to the middle of the row', () => {
    // Regression: on phones the active "Anchoring" pill loaded off-screen.
    const { scroller, item } = layout({ left: 520, width: 120 });
    centerActiveItem(scroller, item);
    expect(scroller.scrollLeft).toBe(520 - (360 - 120) / 2);
  });

  it('measures from the scroller, not from the offset parent it sits inside', () => {
    // Regression: offsetLeft counted the wrapper's inset, so centring was off by ~28px.
    const { scroller, item } = layout({ left: 520, width: 120 }, 28, 100);
    centerActiveItem(scroller, item);
    expect(scroller.scrollLeft).toBe(520 - (360 - 120) / 2);
  });

  it('never scrolls past either end of the row', () => {
    const first = layout({ left: 0, width: 100 });
    centerActiveItem(first.scroller, first.item);
    expect(first.scroller.scrollLeft).toBe(0);

    const last = layout({ left: 820, width: 80 });
    centerActiveItem(last.scroller, last.item);
    expect(last.scroller.scrollLeft).toBe(900 - 360);
  });
});

describe('scrollEdges', () => {
  const scroller = (scrollLeft: number, scrollWidth = 900) =>
    ({ clientWidth: 360, scrollWidth, scrollLeft }) as unknown as HTMLElement;

  it('fades only the edges with pills behind them', () => {
    // At the start the first pill is in full view: no fade on the left.
    expect(scrollEdges(scroller(0))).toEqual({ start: false, end: true });
    expect(scrollEdges(scroller(200))).toEqual({ start: true, end: true });
    expect(scrollEdges(scroller(540))).toEqual({ start: true, end: false });
    // A row that fits fades nowhere.
    expect(scrollEdges(scroller(0, 360))).toEqual({ start: false, end: false });
  });
});
