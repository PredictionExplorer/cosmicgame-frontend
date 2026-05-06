import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import Imprint from './Imprint';

export const metadata: Metadata = createMetadata(
  'Imprint RandomWalk NFT | Cosmic Signature',
  'Imprint a RandomWalk NFT on Cosmic Signature. Each unused RandomWalk NFT can be attached to one ETH gesture for a 50% Gesture-Cost discount.',
  undefined,
  '/imprint',
);

export default function Page() {
  return <Imprint />;
}
