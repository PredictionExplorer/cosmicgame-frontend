import { renderToStaticMarkup } from 'react-dom/server';

import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  datasetJsonLd,
  JsonLd,
  nftProductJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from '@/utils/jsonLd';

describe('JsonLd script body', () => {
  // An owner can write any 32-byte name on-chain; this one is 29 bytes.
  const HOSTILE_NAME = '</script><script src=//ab.cd>';

  it('never lets an owner-set name close the script element', () => {
    const markup = renderToStaticMarkup(
      <JsonLd
        data={[
          nftProductJsonLd({
            tokenId: 25,
            name: HOSTILE_NAME,
            description: 'A Signature',
            imageUrl: 'https://example.com/25.png',
          }),
          breadcrumbJsonLd([{ name: HOSTILE_NAME, path: '/detail/25' }]),
        ]}
      />,
    );
    const body = markup.slice(markup.indexOf('>') + 1, markup.lastIndexOf('</script>'));
    expect(body.toLowerCase()).not.toContain('</script');
    expect(body).not.toMatch(/[<>]/);
    expect(markup.match(/<script/g)).toHaveLength(1);
    expect(JSON.parse(body)[0].name).toBe(HOSTILE_NAME);
  });

  it('parses back to exactly the original value', () => {
    const data = { name: `${HOSTILE_NAME} & <!-- \u2028\u2029 ✓ 漢字` };
    const serialized = serializeJsonLd(data);
    expect(serialized).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(serialized)).toEqual(data);
  });
});

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

  it('builds CollectionPage JSON-LD linked to the site and art-protocol entities', () => {
    expect(
      collectionPageJsonLd({
        name: 'Cosmic Signature Gallery',
        description: 'Every imprinted Signature',
        url: 'https://app.cosmicsignature.com/gallery',
      }),
    ).toEqual(
      expect.objectContaining({
        '@type': 'CollectionPage',
        name: 'Cosmic Signature Gallery',
        url: 'https://app.cosmicsignature.com/gallery',
        isPartOf: { '@id': 'https://cosmicsignature.com/#website' },
        about: { '@id': 'https://cosmicsignature.com/#art-protocol' },
        publisher: { '@id': 'https://cosmicsignature.com/#organization' },
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
