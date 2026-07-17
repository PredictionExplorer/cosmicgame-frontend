import type { Metadata } from 'next';
import { Suspense } from 'react';

import { APP_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import GalleryPage from './GalleryPage';
import { GallerySeoSummary } from './GallerySeoSummary';

const description =
  'Explore Cosmic Signature NFT artwork generated from deterministic three-body physics, on-chain seeds, spectral rendering, and Performance Cycle data.';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Gallery | Deterministic Three-Body NFT Art',
  description,
  undefined,
  '/gallery',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: 'Cosmic Signature Gallery',
            description,
            url: `${APP_ORIGIN}/gallery`,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Gallery', path: '/gallery' },
          ]),
        ]}
      />
      <GallerySeoSummary />
      <Suspense>
        <GalleryPage />
      </Suspense>
    </>
  );
}
