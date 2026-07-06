import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import EthDonations from './EthDonations';

export const metadata: Metadata = createMetadata(
  'Direct ETH Contributions | Cosmic Signature',
  'Contribute ETH directly to the Cosmic Signature Public Goods Vault and view the complete contribution history. Support public goods while taking part in the protocol.',
  undefined,
  '/eth-contribution',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <PublicDataRouteSeoSummary route="eth-contribution" />
      <EthDonations />
    </>
  );
}
