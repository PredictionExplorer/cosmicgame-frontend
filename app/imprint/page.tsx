import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import Imprint from './Imprint';

export const metadata: Metadata = createMetadata(
  'Imprint RandomWalk NFT | Cosmic Signature',
  'Imprint a RandomWalk NFT on Cosmic Signature and unlock a 50% Gesture-Cost discount. RandomWalk NFTs are unique generative collectibles that augment a cycle strategy.',
  undefined,
  '/imprint',
);

export default function Page() {
  return <Imprint />;
}
