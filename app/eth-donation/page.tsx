import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonations from './EthDonations';

export const metadata: Metadata = createMetadata(
  'Direct ETH Contributions | Cosmic Signature',
  'Contribute ETH directly to the Cosmic Signature Public Goods Vault and view the complete contribution history. Support public goods while taking part in the protocol.',
  undefined,
  '/eth-donation',
);

export default function Page() {
  return <EthDonations />;
}
