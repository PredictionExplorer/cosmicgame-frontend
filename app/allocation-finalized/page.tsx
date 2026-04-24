import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createMetadata } from '@/utils/seo';

import PrizeClaimedPage from './PrizeClaimedPage';

export const metadata: Metadata = createMetadata(
  'Retrieved Allocations | Cosmic Signature',
  'Details of retrieved allocations from the Cosmic Signature protocol, including ETH receipts, Cosmic Signature NFT allocations, and Stellar Selection allocations.',
  undefined,
  '/allocation-finalized',
);

export default function Page() {
  return (
    <Suspense>
      <PrizeClaimedPage />
    </Suspense>
  );
}
