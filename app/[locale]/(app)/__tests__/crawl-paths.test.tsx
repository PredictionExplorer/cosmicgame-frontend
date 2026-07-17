import type { ReactElement } from 'react';

import Footer from '@/components/layout/Footer';
import { ECOSYSTEM_DESTINATIONS } from '@/config/ecosystem';
import getNAVs, { type NavDescriptor } from '@/config/nav';
import { appSitemapRoutes } from '@/lib/seoRoutes';

import { render } from '@/test-utils';

import SiteMapPage from '../site-map/SiteMapPage';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

/**
 * Crawl-path parity guard.
 *
 * The header renders its Explore/Help destinations inside client-only
 * dropdown panels, which never appear in the raw HTML that non-rendering
 * search and AI crawlers read. These tests guarantee that every navigation
 * destination keeps a server-rendered anchor on at least one always-present
 * surface (the app footer or the /site-map page), so a future nav redesign
 * can never silently orphan a route.
 */

function collectHrefs(ui: ReactElement): Set<string> {
  const { container, unmount } = render(ui);
  const hrefs = new Set(
    Array.from(container.querySelectorAll('a'))
      .map((anchor) => anchor.getAttribute('href') ?? '')
      .filter(Boolean),
  );
  unmount();
  return hrefs;
}

function internalNavRoutes(navs: NavDescriptor[]): string[] {
  return navs
    .flatMap((nav) => [nav, ...(nav.children ?? [])])
    .map((nav) => nav.route)
    .filter((route): route is string => !!route && route.startsWith('/'));
}

describe('crawl paths', () => {
  let footerHrefs: Set<string>;
  let siteMapHrefs: Set<string>;
  let union: Set<string>;

  beforeAll(() => {
    footerHrefs = collectHrefs(<Footer />);
    siteMapHrefs = collectHrefs(<SiteMapPage />);
    union = new Set([...footerHrefs, ...siteMapHrefs]);
  });

  it('every internal header-nav route has a server-rendered anchor', () => {
    const routes = internalNavRoutes(getNAVs(null, null, (key) => key, 'en'));
    expect(routes.length).toBeGreaterThan(5);
    for (const route of routes) {
      if (!union.has(route)) {
        throw new Error(
          `Nav route ${route} has no crawlable anchor in the footer or /site-map page`,
        );
      }
    }
  });

  it('every XML-sitemap route has a matching HTML anchor', () => {
    for (const { path } of appSitemapRoutes) {
      const href = path === '' ? '/' : path;
      if (!union.has(href)) {
        throw new Error(
          `Sitemap route ${href} has no crawlable anchor in the footer or /site-map page`,
        );
      }
    }
  });

  it('every ecosystem destination is linked from both the footer and the site map', () => {
    for (const destination of ECOSYSTEM_DESTINATIONS) {
      expect(footerHrefs.has(destination.href)).toBe(true);
      expect(siteMapHrefs.has(destination.href)).toBe(true);
    }
  });
});
