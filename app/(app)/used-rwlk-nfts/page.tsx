import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UsedRwlkNftsPage from './UsedRwlkNftsPage';

export const metadata: Metadata = createMetadata(
  'Used RandomWalk NFTs for Bid | Cosmic Signature',
  'Browse the list of RandomWalk NFTs that have been used for 50% bid discounts in the Cosmic Signature game. Each RandomWalk NFT can be used once per wallet.',
  undefined,
  '/used-rwlk-nfts',
);

export default function Page() {
  return <UsedRwlkNftsPage />;
}
