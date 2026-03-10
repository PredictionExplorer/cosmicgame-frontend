import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import NFTDonationsPage from './NFTDonationsPage';

export const metadata: Metadata = createMetadata(
  'NFT Donations | Cosmic Signature',
  'NFT Donations',
);

export default function Page() {
  return <NFTDonationsPage />;
}
