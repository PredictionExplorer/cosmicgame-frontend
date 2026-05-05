import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UsedRwlkNftsPage from './UsedRwlkNftsPage';

export const metadata: Metadata = createMetadata(
  'Used RandomWalk NFTs | Cosmic Signature',
  'RandomWalk NFTs already used for a 50% Gesture-Cost discount in Cosmic Signature. Each RandomWalk NFT can be used once for this discount.',
  undefined,
  '/used-rwlk-nfts',
);

export default function Page() {
  return <UsedRwlkNftsPage />;
}
