import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import AllocationFinalizedPage from './AllocationFinalizedPage';

export const metadata: Metadata = createMetadata(
  'Retrieved Allocations | Cosmic Signature',
  'Details of retrieved allocations from the Cosmic Signature protocol, including ETH receipts, Cosmic Signature NFT allocations, and Stellar Selection allocations.',
  undefined,
  '/allocation-finalized',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <PublicDataRouteSeoSummary route="allocation-finalized" />
      <Suspense>
        <AllocationFinalizedPage />
      </Suspense>
    </>
  );
}
