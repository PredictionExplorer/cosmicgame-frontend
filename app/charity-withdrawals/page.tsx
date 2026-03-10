import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityWithdrawals from './CharityWithdrawals';

export const metadata: Metadata = createMetadata(
  'Withdrawals from Charity Wallet | Cosmic Signature',
  'Withdrawals from Charity Wallet',
);

export default function Page() {
  return <CharityWithdrawals />;
}
