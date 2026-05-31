import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import Contracts from './Contracts';
import { ContractsSeoSummary } from './ContractsSeoSummary';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Contracts | Verified Arbitrum Smart Contracts',
  'Find Cosmic Signature smart contract addresses, verification status, audits, formal verification notes, and Arbitrum deployment details.',
  undefined,
  '/contracts',
);

export default function Page() {
  return (
    <>
      <ContractsSeoSummary />
      <Contracts />
    </>
  );
}
