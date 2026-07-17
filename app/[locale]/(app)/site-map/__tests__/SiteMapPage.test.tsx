import { appSitemapRoutes } from '@/lib/seoRoutes';

import { checkA11y, render, screen, within } from '@/test-utils';

import SiteMapPage, { appToolLinks, dataLinks, ecosystemLinks, systemLinks } from '../SiteMapPage';

describe('SiteMapPage', () => {
  it('renders the page heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Site Map' })).toBeInTheDocument();
  });

  it('renders the per-user section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('Personal App Tools')).toBeInTheDocument();
  });

  it('renders all per-user links', () => {
    render(<SiteMapPage />);
    const expectedLinks = [
      { label: 'My NFTs', href: '/my-tokens' },
      { label: 'My Unretrieved Allocations', href: '/my-allocations' },
      { label: 'My Anchors', href: '/my-anchors' },
    ];
    for (const { label, href } of expectedLinks) {
      const link = screen.getByRole('link', { name: new RegExp(label) });
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('renders the system section heading', () => {
    render(<SiteMapPage />);
    expect(screen.getByText('Public Protocol Pages')).toBeInTheDocument();
  });

  it('renders all system links', () => {
    render(<SiteMapPage />);
    const expectedLinks = [
      { label: 'About Cosmic Signature', href: 'https://cosmicsignature.com/about' },
      { label: 'Cosmic Signature Learn Hub', href: 'https://cosmicsignature.com/learn' },
      {
        label: 'What Is Cosmic Signature?',
        href: 'https://cosmicsignature.com/learn/what-is-cosmic-signature',
      },
      {
        label: 'Three-Body NFT Art Guide',
        href: 'https://cosmicsignature.com/learn/three-body-nft-art',
      },
      { label: 'Cosmic Signature Gallery', href: '/gallery' },
      { label: 'Current Performance Cycle', href: '/current-cycle' },
      { label: 'Protocol Statistics', href: '/statistics' },
      { label: 'Cosmic Signature Contracts', href: '/contracts' },
      { label: 'Source Code', href: '/code' },
      { label: 'Security', href: '/security' },
      { label: 'Audits', href: '/audits' },
      { label: 'Risk Disclosures', href: '/risk-disclosures' },
      { label: 'Cosmic Signature FAQ', href: '/faq' },
    ];
    for (const { label, href } of expectedLinks) {
      const link = screen.getByRole('link', { name: new RegExp(label) });
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
    expect(screen.getByText('Protocol Data Pages')).toBeInTheDocument();
    for (const { href } of dataLinks) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it('renders the ecosystem section with external destinations', () => {
    render(<SiteMapPage />);
    expect(screen.getByRole('link', { name: /Axiom Zero Marketplace/ })).toHaveAttribute(
      'href',
      'https://www.axiomzero.market/cosmic-signature',
    );
    expect(screen.getByRole('link', { name: /Chaos Zero Predictions/ })).toHaveAttribute(
      'href',
      'https://chaoszero.com',
    );
    expect(screen.getByRole('link', { name: /Trade CST on Uniswap/ }).getAttribute('href')).toMatch(
      /^https:\/\/app\.uniswap\.org\//,
    );
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
