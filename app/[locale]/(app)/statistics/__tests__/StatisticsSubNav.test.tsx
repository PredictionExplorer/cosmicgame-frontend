import statisticsMessages from '@/messages/en/statistics.json';

import { render, screen, checkA11y } from '@/test-utils';

import { StatisticsSubNav, centerActiveItem } from '../StatisticsSubNav';
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
  /** A scroller and an item with the layout jsdom does not compute. */
  function layout(item: { offsetLeft: number; offsetWidth: number }) {
    const scroller = { clientWidth: 360, scrollWidth: 900, scrollLeft: 0 } as HTMLElement;
    return { scroller, item: item as HTMLElement };
  }

  it('scrolls a later section to the middle of the row', () => {
    // Regression: on phones the active "Anchoring" pill loaded off-screen.
    const { scroller, item } = layout({ offsetLeft: 520, offsetWidth: 120 });
    centerActiveItem(scroller, item);
    expect(scroller.scrollLeft).toBe(520 - (360 - 120) / 2);
  });

  it('never scrolls past either end of the row', () => {
    const first = layout({ offsetLeft: 0, offsetWidth: 100 });
    centerActiveItem(first.scroller, first.item);
    expect(first.scroller.scrollLeft).toBe(0);

    const last = layout({ offsetLeft: 820, offsetWidth: 80 });
    centerActiveItem(last.scroller, last.item);
    expect(last.scroller.scrollLeft).toBe(900 - 360);
  });
});
