import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyWinnings from './MyWinnings';

export const metadata: Metadata = createMetadata(
  'Pending Winnings | Cosmic Signature',
  'View and claim your pending ETH rewards, raffle winnings, staking distributions, and donated assets from the Cosmic Signature game.',
  undefined,
  '/my-winnings',
);

export default function Page() {
  return <MyWinnings />;
}
