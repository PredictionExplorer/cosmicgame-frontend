import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UsedRwlkNftsPage from './UsedRwlkNftsPage';

export const metadata: Metadata = createMetadata(
  'Used RandomWalk NFTs for Bid | Cosmic Signature',
  'Used RandomWalk NFTs for Bid',
);

export default function Page() {
  return <UsedRwlkNftsPage />;
}
