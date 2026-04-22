import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createMetadata } from '@/utils/seo';

import GalleryPage from './GalleryPage';

export const metadata: Metadata = createMetadata(
  'Gallery | Cosmic Signature',
  'Explore the COSMIC NFT Gallery and discover a unique collection of digital art. Immerse yourself in vibrant, one-of-a-kind NFTs, each telling a cosmic story. Start your journey into the digital universe today!',
  undefined,
  '/gallery',
);

export default function Page() {
  return (
    <Suspense>
      <GalleryPage />
    </Suspense>
  );
}
