import { appSitemapRoutes } from '@/lib/seoRoutes';

import { checkA11y, render, screen, within } from '@/test-utils';

import SiteMapPage, { appToolLinks, dataLinks, ecosystemLinks, systemLinks } from '../SiteMapPage';

describe('SiteMapPage', () => {
  it('renders the page heading', () => {
    render(<SiteMapPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'siteMap.page.title' }),
    ).toBeInTheDocument();
  });

  it('renders the per-user section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('siteMap.sections.personal.title')).toBeInTheDocument();
  });

  it('renders all per-user links', () => {
    render(<SiteMapPage />);
    for (const { id, href } of appToolLinks) {
      const link = screen.getByRole('link', {
        name: new RegExp(`siteMap\\.links\\.${id}\\.label`),
      });
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('renders the system section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('siteMap.sections.system.title')).toBeInTheDocument();
  });

  it('renders all system links', () => {
    render(<SiteMapPage />);
    for (const { id, href } of systemLinks) {
      const link = screen.getByRole('link', {
        name: new RegExp(`siteMap\\.links\\.${id}\\.label`),
      });
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('renders the correct total number of links in main (sitemap + breadcrumb)', () => {
    render(<SiteMapPage />);
    const main = screen.getByRole('main');
    const links = within(main).getAllByRole('link');
    const breadcrumbHomeLink = 1;
    expect(links).toHaveLength(
      appToolLinks.length +
        systemLinks.length +
        dataLinks.length +
        ecosystemLinks.length +
        breadcrumbHomeLink,
    );
  });

  it('renders the protocol data section with every data route', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('siteMap.sections.data.title')).toBeInTheDocument();
    for (const { href } of dataLinks) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it('renders the ecosystem section with external destinations', () => {
    render(<SiteMapPage />);
    expect(screen.getByRole('link', { name: /siteMap\.links\.axiomZero\.label/ })).toHaveAttribute(
      'href',
      'https://www.axiomzero.market/cosmic-signature',
    );
    expect(screen.getByRole('link', { name: /siteMap\.links\.chaosZero\.label/ })).toHaveAttribute(
      'href',
      'https://chaoszero.com',
    );
    expect(
      screen.getByRole('link', { name: /siteMap\.links\.uniswap\.label/ }).getAttribute('href'),
    ).toMatch(/^https:\/\/app\.uniswap\.org\//);
  });

  it('covers every indexable XML-sitemap route with an HTML link', () => {
    render(<SiteMapPage />);
    for (const { path } of appSitemapRoutes) {
      // The page does not need to link to itself; the app footer covers it.
      if (path === '/site-map') continue;
      const href = path === '' ? '/' : path;
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it('does not expose CST transfer or hidden outreach transfer tools', () => {
    render(<SiteMapPage />);

    expect(document.querySelector('a[href="/transfer-cst"]')).toBeNull();
    expect(document.querySelector('a[href="/internal/cst-outreach-transfer"]')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SiteMapPage />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
