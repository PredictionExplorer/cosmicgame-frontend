import type { Metadata } from 'next';

import { APP_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import SiteMapPage from './SiteMapPage';

const description =
  'Navigate every section of the Cosmic Signature protocol \u2014 gestures, NFT gallery, anchoring, statistics, allocations, and public-goods contributions.';

export const metadata: Metadata = createMetadata(
  'Site Map | Cosmic Signature',
  description,
  undefined,
  '/site-map',
);

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: 'Cosmic Signature Site Map',
            description,
            url: `${APP_ORIGIN}/site-map`,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Site Map', path: '/site-map' },
          ]),
        ]}
      />
      <SiteMapPage />
    </>
  );
}
