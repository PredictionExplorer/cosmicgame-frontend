import statisticsMessages from '@/messages/en/statistics.json';

import { act, render, screen, checkA11y } from '@/test-utils';

import { StatisticsSubNav } from '../StatisticsSubNav';
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

/** Reports the sentinel above the bar as a browser would: its box and whether it is in view. */
type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let observe: ObserverCallback = () => {};
const OriginalIntersectionObserver = global.IntersectionObserver;

beforeEach(() => {
  global.IntersectionObserver = class {
    constructor(callback: ObserverCallback) {
      observe = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  global.IntersectionObserver = OriginalIntersectionObserver;
});

const sentinelAt = (top: number, isIntersecting: boolean) =>
  act(() => observe([{ isIntersecting, boundingClientRect: { top } as DOMRectReadOnly }]));

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

  it('takes the glass band only once it floats over the content', () => {
    mockPathname = '/statistics';
    render(<StatisticsSubNav />);
    const nav = screen.getByRole('navigation', { name: 'Statistics sections' });
    expect(nav).not.toHaveAttribute('data-stuck');

    // The sentinel scrolled up under the header: the bar is stuck.
    sentinelAt(-120, false);
    expect(nav).toHaveAttribute('data-stuck', 'true');

    // Back in view, or below the fold on a short page: not stuck.
    sentinelAt(300, true);
    expect(nav).not.toHaveAttribute('data-stuck');
    sentinelAt(2000, false);
    expect(nav).not.toHaveAttribute('data-stuck');
  });
});
