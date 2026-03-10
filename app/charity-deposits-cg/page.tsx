import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityCGDeposits from './CharityCGDeposits';

export const metadata: Metadata = createMetadata(
  'Cosmic Game Charity Deposits | Cosmic Signature',
  'Cosmic Game Charity Deposits',
);

export default function Page() {
  return <CharityCGDeposits />;
}
