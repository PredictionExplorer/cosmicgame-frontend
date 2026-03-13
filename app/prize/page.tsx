import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import PrizeWinnersPage from './PrizeWinnersPage';

export const metadata: Metadata = createMetadata(
  'Main Prize Winnings | Cosmic Signature',
  'View the complete history of Cosmic Signature main prize winners, round statistics, and ETH prize distributions across all completed game rounds.',
  undefined,
  '/prize',
);

export default function Page() {
  return <PrizeWinnersPage />;
}
