import {
  breadcrumbJsonLd,
  datasetJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/utils/jsonLd';

describe('JSON-LD builders', () => {
  it('uses stable Organization and WebSite IDs on the canonical landing host', () => {
    expect(organizationJsonLd()).toEqual(
      expect.objectContaining({
        '@type': 'Organization',
        '@id': 'https://cosmicsignature.com/#organization',
        url: 'https://cosmicsignature.com/',
        sameAs: expect.arrayContaining(['https://github.com/PredictionExplorer']),
      }),
    );
    expect(websiteJsonLd()).toEqual(
      expect.objectContaining({
        '@type': 'WebSite',
        '@id': 'https://cosmicsignature.com/#website',
        publisher: { '@id': 'https://cosmicsignature.com/#organization' },
      }),
    );
  });

  it('builds canonical WebPage JSON-LD with publisher reference', () => {
    expect(
      webPageJsonLd({
        name: 'Cosmic Signature Security',
        description: 'Security overview',
        url: 'https://app.cosmicsignature.com/security',
      }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'WebPage',
        name: 'Cosmic Signature Security',
        url: 'https://app.cosmicsignature.com/security',
        publisher: { '@id': 'https://cosmicsignature.com/#organization' },
      }),
    );
  });

  it('builds accessible Dataset JSON-LD for visible protocol statistics', () => {
    expect(
      datasetJsonLd({
        name: 'Stats',
        description: 'Visible statistics',
        url: 'https://app.cosmicsignature.com/statistics',
        dateModified: '2026-05-31T00:00:00.000Z',
      }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'Dataset',
        isAccessibleForFree: true,
        dateModified: '2026-05-31T00:00:00.000Z',
      }),
    );
  });

  it('builds canonical breadcrumb item URLs from relative paths', () => {
    expect(
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Security', path: '/security' },
      ]),
    ).toEqual(
      expect.objectContaining({
        '@type': 'BreadcrumbList',
        itemListElement: expect.arrayContaining([
          expect.objectContaining({
            position: 2,
            name: 'Security',
            item: 'https://app.cosmicsignature.com/security',
          }),
        ]),
      }),
    );
  });
});
