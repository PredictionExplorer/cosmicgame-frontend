import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityWithdrawals from './CharityWithdrawals';

export const metadata: Metadata = createMetadata(
  'Withdrawals from Charity Wallet | Cosmic Signature',
  'Track charitable fund withdrawals from the Cosmic Signature game. Each round, 10% of the prize pool is allocated to a beneficiary chosen by the Cosmic DAO.',
  undefined,
  '/charity-withdrawals',
);

export default function Page() {
  return <CharityWithdrawals />;
}
