import { render, screen, checkA11y } from '@/test-utils';

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

describe('StatisticsSubNav', () => {
  it('renders one link per statistics section', () => {
    mockPathname = '/statistics';
    render(<StatisticsSubNav />);
    const nav = screen.getByRole('navigation', { name: 'Statistics sections' });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(ALL_STATISTICS_SECTIONS.length);
    for (const section of ALL_STATISTICS_SECTIONS) {
      expect(screen.getByRole('link', { name: section.label })).toHaveAttribute(
        'href',
        section.href,
      );
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
