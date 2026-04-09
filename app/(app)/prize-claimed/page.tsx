import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createMetadata } from '@/utils/seo';

import PrizeClaimedPage from './PrizeClaimedPage';

export const metadata: Metadata = createMetadata(
  'Claimed Prize Rewards | Cosmic Signature',
  'Details of your claimed prize rewards from the Cosmic Signature bidding game, including ETH winnings, NFT prizes, and raffle rewards.',
  undefined,
  '/prize-claimed',
);

export default function Page() {
  return (
    <Suspense>
      <PrizeClaimedPage />
    </Suspense>
  );
}
