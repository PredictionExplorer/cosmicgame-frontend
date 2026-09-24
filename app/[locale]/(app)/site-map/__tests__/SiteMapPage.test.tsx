import { OUTBOUND_LINKS, SITE_ROUTES, SITE_SECTION_IDS, siteHostLabel } from '@/config/siteNav';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { appSitemapRoutes } from '@/lib/seoRoutes';

import { checkA11y, render, screen, within } from '@/test-utils';

import SiteMapPage, { SITE_MAP_COLUMNS } from '../SiteMapPage';

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

  it('lays the sections out in one column per header menu, each section once', () => {
    expect([...SITE_MAP_COLUMNS.flat()].sort()).toEqual([...SITE_SECTION_IDS].sort());
    render(<SiteMapPage />);
    // DOM order follows the columns, so the two-column flow below 1280px
    // and the stacked phone list read in the same order.
    const order = [...document.querySelectorAll('section[id]')].map((section) => section.id);
    expect(order.slice(0, SITE_SECTION_IDS.length)).toEqual(SITE_MAP_COLUMNS.flat());
    for (const column of SITE_MAP_COLUMNS) {
      const wrapper = document.getElementById(column[0]!)!.parentElement!;
      expect(wrapper).toHaveClass('contents', 'xl:block');
      expect([...wrapper.children].map((child) => child.id)).toEqual(column);
    }
  });

  it('starts each column on one rule: the header drops its own from 640px', () => {
    render(<SiteMapPage />);
    expect(screen.getByRole('banner')).toHaveClass('sm:border-b-0');
    const lead = document.getElementById(SITE_MAP_COLUMNS[0]![0]!)!;
    // On phones the first section sits under the header's rule instead.
    expect(lead).toHaveClass('max-sm:border-t-0', 'sm:border-rule');
    expect(document.getElementById('records')).not.toHaveClass('max-sm:border-t-0');
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

  it('lists the learn articles as the Learn Hub guides, in a band under the columns', () => {
    render(<SiteMapPage articles={ARTICLES} />);
    const guides = screen
      .getByRole('heading', { level: 2, name: 'nav.routes.learnHub.label' })
      .closest('section')!;
    expect(guides).toHaveAttribute('id', 'guides');
    expect(within(guides).getByRole('link', { name: 'What Is Cosmic Signature?' })).toHaveAttribute(
      'href',
      localeHref(LANDING_ORIGIN, '/learn/what-is-cosmic-signature', 'en'),
    );
    // Not inside the Learn section, whose column they used to double.
    const learn = screen
      .getByRole('heading', { level: 2, name: 'nav.sections.learn' })
      .closest('section')!;
    expect(within(learn).queryByRole('link', { name: 'What Is Cosmic Signature?' })).toBeNull();
  });

  it('names the Trust section above the heading instead of a trail that repeats the H1', () => {
    render(<SiteMapPage />);
    expect(
      screen.queryByRole('navigation', { name: 'common.accessibility.breadcrumb' }),
    ).toBeNull();
    expect(screen.getByRole('link', { name: 'nav.sections.trust' })).toHaveAttribute(
      'href',
      '/security',
    );
  });

  it('anchors each section by its id, where page headers lead the Records eyebrow', () => {
    render(<SiteMapPage />);
    for (const section of SITE_SECTION_IDS) {
      expect(
        screen
          .getByRole('heading', { level: 2, name: `nav.sections.${section}` })
          .closest('section'),
      ).toHaveAttribute('id', section);
    }
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

  it('never folds: every link shows at every width, without script, two names a row on phones', () => {
    const { container } = render(<SiteMapPage articles={ARTICLES} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('[class*="max-sm:hidden"] a')).toBeNull();
    const learn = screen.getByRole('region', { name: /nav\.sections\.learn/ });
    expect(within(learn).getByRole('list')).toHaveClass('grid-cols-2', 'sm:flex');
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
