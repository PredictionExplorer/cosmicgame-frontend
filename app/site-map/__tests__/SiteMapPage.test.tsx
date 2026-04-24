import { checkA11y, render, screen, within } from '@/test-utils';

import SiteMapPage from '../SiteMapPage';

describe('SiteMapPage', () => {
  it('renders the page heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Site Map' })).toBeInTheDocument();
  });

  it('renders the per-user section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('Per-user information')).toBeInTheDocument();
  });

  it('renders all per-user links', () => {
    render(<SiteMapPage />);
    const expectedLinks = [
      { label: 'My Tokens', href: '/my-tokens' },
      { label: 'My Unretrieved Allocations', href: '/my-allocations' },
      { label: 'History of My Allocations', href: '/recipient-history' },
      { label: 'My Anchors', href: '/my-anchors' },
    ];
    for (const { label, href } of expectedLinks) {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('renders the system section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('Overall system information')).toBeInTheDocument();
  });

  it('renders all system links', () => {
    render(<SiteMapPage />);
    const expectedLinks = [
      { label: 'Cosmic Signature Gallery', href: '/gallery' },
      { label: 'Cycles Completed', href: '/prize' },
      { label: 'Anchor Distributions', href: '/anchoring' },
      { label: 'Outreach Allocations', href: '/marketing' },
      { label: 'System Statistics', href: '/statistics' },
      { label: 'Contract Addresses', href: '/contracts' },
      { label: 'FAQ', href: '/faq' },
    ];
    for (const { label, href } of expectedLinks) {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('renders the correct total number of links in main (sitemap + breadcrumb)', () => {
    render(<SiteMapPage />);
    const main = screen.getByRole('main');
    const links = within(main).getAllByRole('link');
    expect(links).toHaveLength(14);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SiteMapPage />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
