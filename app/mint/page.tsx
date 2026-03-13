import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import Mint from './Mint';

export const metadata: Metadata = createMetadata(
  'Mint | Cosmic Signature',
  'Mint a RandomWalk NFT on Cosmic Signature and unlock a 50% discount on your bids. RandomWalk NFTs are unique digital collectibles that enhance your gameplay strategy.',
  undefined,
  '/mint',
);

export default function Page() {
  return <Mint />;
}
