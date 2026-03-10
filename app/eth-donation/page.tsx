import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonations from './EthDonations';

export const metadata: Metadata = createMetadata(
  'Direct (ETH) Donations | Cosmic Signature',
  'Direct (ETH) Donations',
);

export default function Page() {
  return <EthDonations />;
}
