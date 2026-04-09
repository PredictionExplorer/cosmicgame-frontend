import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonations from './EthDonations';

export const metadata: Metadata = createMetadata(
  'Direct (ETH) Donations | Cosmic Signature',
  'Donate ETH directly to the Cosmic Signature charity pool and view the complete donation history. Support charitable causes while participating in the game ecosystem.',
  undefined,
  '/eth-donation',
);

export default function Page() {
  return <EthDonations />;
}
