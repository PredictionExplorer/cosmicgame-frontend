import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import PrizeWinnersPage from './PrizeWinnersPage';

export const metadata: Metadata = createMetadata(
  'Main Prize Winnings | Cosmic Signature',
  'Main Prize Winnings',
);

export default function Page() {
  return <PrizeWinnersPage />;
}
