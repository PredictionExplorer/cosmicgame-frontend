import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityDepositsVoluntary from './CharityDepositsVoluntary';

export const metadata: Metadata = createMetadata(
  'Voluntary Public-Goods Contributions | Cosmic Signature',
  'Voluntary contributions to the Public Goods Vault from the Cosmic Signature community. Contributions support beneficiaries selected through Cosmic Council coordination.',
  undefined,
  '/charity-deposits-voluntary',
);

export default function Page() {
  return <CharityDepositsVoluntary />;
}
