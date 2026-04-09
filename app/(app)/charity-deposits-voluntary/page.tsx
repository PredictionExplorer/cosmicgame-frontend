import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityDepositsVoluntary from './CharityDepositsVoluntary';

export const metadata: Metadata = createMetadata(
  'Deposits To Charity Wallet | Cosmic Signature',
  'View voluntary charitable donations made by Cosmic Signature community members. These contributions support causes chosen by the Cosmic DAO governance system.',
  undefined,
  '/charity-deposits-voluntary',
);

export default function Page() {
  return <CharityDepositsVoluntary />;
}
