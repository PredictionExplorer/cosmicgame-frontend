import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import StakingPage from './StakingPage';

export const metadata: Metadata = createMetadata(
  'Staking | Cosmic Signature',
  'Stake your COSMIC NFTs to earn passive ETH rewards every round. View global staking stats, reward distributions, and learn how staking works on Arbitrum.',
  undefined,
  '/staking',
);

export default function Page() {
  return <StakingPage />;
}
