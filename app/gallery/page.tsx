import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createMetadata } from '@/utils/seo';

import GalleryPage from './GalleryPage';
import { GallerySeoSummary } from './GallerySeoSummary';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Gallery | Deterministic Three-Body NFT Art',
  'Explore Cosmic Signature NFT artwork generated from deterministic three-body physics, on-chain seeds, spectral rendering, and Performance Cycle data.',
  undefined,
  '/gallery',
);

export default function Page() {
  return (
    <>
      <GallerySeoSummary />
      <Suspense>
        <GalleryPage />
      </Suspense>
    </>
  );
}
