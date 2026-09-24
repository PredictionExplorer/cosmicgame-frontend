import type { ReactElement } from 'react';

import Footer from '@/components/layout/Footer';
import { OUTBOUND_LINKS, appHeaderRouteIds, getSiteRoute } from '@/config/siteNav';
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
 * The header renders its Explore and Learn destinations inside client-only
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
    const routes = appHeaderRouteIds()
      .map(getSiteRoute)
      .filter((route) => route.host === 'app')
      .map((route) => route.path);
    expect(routes.length).toBeGreaterThan(15);
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

  it('every ecosystem and community destination is linked from both the footer and the site map', () => {
    for (const link of OUTBOUND_LINKS) {
      expect(footerHrefs.has(link.href)).toBe(true);
      expect(siteMapHrefs.has(link.href)).toBe(true);
    }
  });
});
