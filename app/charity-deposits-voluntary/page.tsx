import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityDepositsVoluntary from './CharityDepositsVoluntary';

export const metadata: Metadata = createMetadata(
  'Deposits To Charity Wallet | Cosmic Signature',
  'Deposits To Charity Wallet',
);

export default function Page() {
  return <CharityDepositsVoluntary />;
}
