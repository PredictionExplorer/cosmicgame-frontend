import userEvent from '@testing-library/user-event';

import { OUTBOUND_LINKS, SITE_ROUTES, SITE_SECTION_IDS, siteHostLabel } from '@/config/siteNav';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { appSitemapRoutes } from '@/lib/seoRoutes';

import { checkA11y, render, screen, within } from '@/test-utils';

import SiteMapPage from '../SiteMapPage';

const ARTICLES = [
  { slug: 'what-is-cosmic-signature', title: 'What Is Cosmic Signature?' },
  { slug: 'three-body-nft-art', title: 'Three-Body NFT Art' },
];

describe('SiteMapPage', () => {
  it('renders the page heading', () => {
    render(<SiteMapPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'siteMap.page.title' }),
    ).toBeInTheDocument();
  });

  it('groups every destination under the sections the menus use', () => {
    render(<SiteMapPage />);
    for (const section of SITE_SECTION_IDS) {
      const heading = screen.getByRole('heading', { level: 2, name: `nav.sections.${section}` });
      const region = heading.closest('section')!;
      expect(within(region).getByText(`siteMap.sections.${section}`)).toBeInTheDocument();
      for (const route of SITE_ROUTES.filter((candidate) => candidate.section === section)) {
        expect(
          within(region).getByRole('link', {
            name: new RegExp(`nav\\.routes\\.${route.id}\\.label`),
          }),
        ).toBeInTheDocument();
      }
    }
  });

  it('always lists the account pages', () => {
    render(<SiteMapPage />);
    for (const href of [
      '/my-statistics',
      '/my-allocations',
      '/recipient-history',
      '/transfer-cst',
    ]) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it('names the project site once above its rows and keeps them in the same tab', () => {
    render(<SiteMapPage articles={ARTICLES} />);
    const learn = screen
      .getByRole('heading', { level: 2, name: 'nav.sections.learn' })
      .closest('section')!;
    expect(within(learn).getAllByText(siteHostLabel('landing'))).toHaveLength(1);
    const whitePaper = within(learn).getByRole('link', { name: /nav\.routes\.whitePaper\.label/ });
    expect(whitePaper).toHaveAttribute('href', localeHref(LANDING_ORIGIN, '/white-paper', 'en'));
    expect(whitePaper).not.toHaveAttribute('target');
  });

  it('lists the learn articles under the Learn Hub', () => {
    render(<SiteMapPage articles={ARTICLES} />);
    expect(screen.getByRole('link', { name: 'What Is Cosmic Signature?' })).toHaveAttribute(
      'href',
      localeHref(LANDING_ORIGIN, '/learn/what-is-cosmic-signature', 'en'),
    );
  });

  it('opens ecosystem and community links in a new tab', () => {
    render(<SiteMapPage />);
    for (const link of OUTBOUND_LINKS) {
      const anchor = screen.getByRole('link', {
        name: new RegExp(`^nav\\.outbound\\.${link.id}\\.label`),
      });
      expect(anchor).toHaveAttribute('href', link.href);
      expect(anchor).toHaveAttribute('target', '_blank');
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('covers every indexable XML-sitemap route with an HTML link', () => {
    render(<SiteMapPage />);
    for (const { path } of appSitemapRoutes) {
      const href = path === '' ? '/' : path;
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it('folds each section on phones with CSS, keeping its line and its links in the HTML', async () => {
    render(<SiteMapPage articles={ARTICLES} />);
    const toggles = screen.getAllByRole('button', { expanded: false });
    // Every section of the taxonomy, plus the ecosystem and community.
    expect(toggles).toHaveLength(SITE_SECTION_IDS.length + 2);
    for (const toggle of toggles) {
      expect(toggle).toHaveClass('sm:hidden');
      const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '')!;
      expect(panel).toHaveClass('max-sm:hidden');
      expect(within(panel).getAllByRole('link').length).toBeGreaterThan(0);
    }
    expect(screen.getByText('siteMap.sections.learn')).not.toHaveClass('max-sm:hidden');

    const learn = screen.getByRole('button', { name: /nav\.sections\.learn/ });
    await userEvent.setup().click(learn);
    expect(learn).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(learn.getAttribute('aria-controls') ?? '')).not.toHaveClass(
      'max-sm:hidden',
    );
    // The section landmark is still named by its heading.
    expect(screen.getByRole('region', { name: /nav\.sections\.learn/ })).toBeInTheDocument();
  });

  it('does not expose the hidden outreach transfer tool', () => {
    render(<SiteMapPage />);
    expect(document.querySelector('a[href="/internal/cst-outreach-transfer"]')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SiteMapPage articles={ARTICLES} />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
