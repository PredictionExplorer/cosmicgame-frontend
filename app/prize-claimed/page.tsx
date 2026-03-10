import type { Metadata } from 'next';
import { Suspense } from 'react';

import { createMetadata } from '@/utils/seo';

import PrizeClaimedPage from './PrizeClaimedPage';

export const metadata: Metadata = createMetadata(
  'Claimed Prize Rewards | Cosmic Signature',
  'Claimed Prize Rewards',
);

export default function Page() {
  return (
    <Suspense>
      <PrizeClaimedPage />
    </Suspense>
  );
}
