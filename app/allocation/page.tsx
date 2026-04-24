import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import PrizeWinnersPage from './PrizeWinnersPage';

export const metadata: Metadata = createMetadata(
  'Allocation Recipients | Cosmic Signature',
  'View the complete history of Cosmic Signature allocation recipients, cycle statistics, and ETH distributions across all finalized Performance Cycles.',
  undefined,
  '/allocation',
);

export default function Page() {
  return <PrizeWinnersPage />;
}
