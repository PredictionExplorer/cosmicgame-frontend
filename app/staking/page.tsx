import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import StakingPage from './StakingPage';

export const metadata: Metadata = createMetadata('Staking | Cosmic Signature', 'Staking');

export default function Page() {
  return <StakingPage />;
}
