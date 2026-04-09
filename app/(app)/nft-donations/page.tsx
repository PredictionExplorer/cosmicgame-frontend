import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import NFTDonationsPage from './NFTDonationsPage';

export const metadata: Metadata = createMetadata(
  'NFT Donations | Cosmic Signature',
  'Browse the history of NFT donations contributed to the Cosmic Signature prize pool by community members. Donated NFTs are awarded to main prize winners each round.',
  undefined,
  '/nft-donations',
);

export default function Page() {
  return <NFTDonationsPage />;
}
