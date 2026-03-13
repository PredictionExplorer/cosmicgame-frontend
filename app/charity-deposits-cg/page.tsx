import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CharityCGDeposits from './CharityCGDeposits';

export const metadata: Metadata = createMetadata(
  'Cosmic Game Charity Deposits | Cosmic Signature',
  "View automatic charity deposits from the Cosmic Signature game. A percentage of every round's prize pool is deposited to support charitable causes via the Cosmic DAO.",
  undefined,
  '/charity-deposits-cg',
);

export default function Page() {
  return <CharityCGDeposits />;
}
