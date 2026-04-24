import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import NFTDonationsPage from './NFTDonationsPage';

export const metadata: Metadata = createMetadata(
  'Attached NFT Contributions | Cosmic Signature',
  'Browse the history of NFTs attached to gestures by community members. Attached NFTs forward to the participant who receives the Signature Allocation each cycle.',
  undefined,
  '/nft-donations',
);

export default function Page() {
  return <NFTDonationsPage />;
}
