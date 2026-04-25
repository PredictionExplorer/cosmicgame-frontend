import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createMetadata } from '@/utils/seo';

import AllocationFinalizedPage from './AllocationFinalizedPage';

export const metadata: Metadata = createMetadata(
  'Retrieved Allocations | Cosmic Signature',
  'Details of retrieved allocations from the Cosmic Signature protocol, including ETH receipts, Cosmic Signature NFT allocations, and Stellar Selection allocations.',
  undefined,
  '/allocation-finalized',
);

export default function Page() {
  return (
    <Suspense>
      <AllocationFinalizedPage />
    </Suspense>
  );
}
