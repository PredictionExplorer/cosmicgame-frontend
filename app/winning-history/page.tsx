import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import WinningHistory from './WinningHistory';

export const metadata: Metadata = createMetadata(
  'History of My Winnings | Cosmic Signature',
  'View your complete winning history in the Cosmic Signature game, including main prizes, raffle ETH rewards, NFT wins, and staking distributions.',
  undefined,
  '/winning-history',
);

export default function Page() {
  return <WinningHistory />;
}
