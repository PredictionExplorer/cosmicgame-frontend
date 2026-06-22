import { metadata as sampleDetailMetadata } from '@/app/detail/sample/page';
import { metadata as cstOutreachTransferMetadata } from '@/app/internal/cst-outreach-transfer/page';
import { metadata as recipientHistoryMetadata } from '@/app/recipient-history/page';
import { metadata as transferCstMetadata } from '@/app/transfer-cst/page';

import { appSitemapRoutes, dynamicNoindexRoutePrefixes, noindexAppRoutes } from '@/lib/seoRoutes';
import { createMetadata } from '@/utils/seo';

jest.mock('../detail/sample/SampleDetailPage', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../internal/cst-outreach-transfer/CstOutreachTransferPage', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../transfer-cst/TransferCstPage', () => ({
  __esModule: true,
  default: () => null,
}));

function expectIndexable(metadata: { robots?: unknown }) {
  expect(metadata.robots).toEqual(
    expect.objectContaining({
      index: true,
      follow: true,
      googleBot: expect.objectContaining({
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      }),
    }),
  );
}

function expectNoIndex(metadata: { robots?: unknown }) {
  expect(metadata.robots).toEqual(
    expect.objectContaining({
      index: false,
      follow: true,
      googleBot: expect.objectContaining({
        index: false,
        follow: true,
      }),
    }),
  );
}

describe('SEO route policy', () => {
  it('marks major public protocol pages as indexable with rich snippets allowed', () => {
    expectIndexable(createMetadata('Public', 'Public description', undefined, '/statistics'));
    expectIndexable(createMetadata('Contracts', 'Contract description', undefined, '/contracts'));
  });

  it('marks admin and wallet-specific pages as noindex,follow', () => {
    expectNoIndex(
      createMetadata('Admin', 'Admin description', undefined, '/admin', { index: false }),
    );
    expectNoIndex(
      createMetadata('My Tokens', 'Wallet description', undefined, '/my-tokens', {
        index: false,
      }),
    );
  });

  it('marks user profile routes as noindex with a self canonical', () => {
    const metadata = createMetadata(
      'Information for User 0x0000000000000000000000000000000000000000 | Cosmic Signature',
      'Information for User 0x0000000000000000000000000000000000000000',
      undefined,
      '/user/0x0000000000000000000000000000000000000000',
      { index: false },
    );

    expectNoIndex(metadata);
    expect(metadata.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/user/0x0000000000000000000000000000000000000000',
    });
  });

  it('keeps noindex routes out of the app sitemap', () => {
    const sitemapPaths = new Set(appSitemapRoutes.map((route) => route.path));

    for (const route of noindexAppRoutes) {
      expect(route.index).toBe(false);
      expect(route.includeInSitemap).toBe(false);
      expect(sitemapPaths).not.toContain(route.path);
    }
  });

  it('marks wallet-personal and demo detail routes as noindex', () => {
    expectNoIndex(recipientHistoryMetadata);
    expectNoIndex(transferCstMetadata);
    expectNoIndex(sampleDetailMetadata);
  });

  it('marks the URL-only CST outreach transfer route as noindex and out of sitemap', () => {
    expectNoIndex(cstOutreachTransferMetadata);
    expect(noindexAppRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/internal/cst-outreach-transfer',
          kind: 'admin',
          index: false,
          includeInSitemap: false,
        }),
      ]),
    );
  });

  it('requires every app sitemap route to be indexable and server-visible', () => {
    for (const route of appSitemapRoutes) {
      expect(route.index).toBe(true);
      expect(route.includeInSitemap).toBe(true);
      expect(route.hasServerVisibleContent).toBe(true);
    }
  });

  it('tracks dynamic noindex route prefixes for policy coverage', () => {
    expect(dynamicNoindexRoutePrefixes).toEqual(
      expect.arrayContaining(['/gesture/', '/user/', '/system-event/', '/marketing/']),
    );
  });
});
