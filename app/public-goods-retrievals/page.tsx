import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityWithdrawals from './CharityWithdrawals';

export const metadata: Metadata = createMetadata(
  'Public Goods Retrievals | Cosmic Signature',
  'Retrievals from the Public Goods Vault. Each cycle, a share of the Cycle Reserve is forwarded to a beneficiary address selected by the Cosmic Council.',
  undefined,
  '/public-goods-retrievals',
);

export default function Page() {
  return <CharityWithdrawals />;
}
