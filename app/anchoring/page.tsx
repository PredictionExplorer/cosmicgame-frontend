import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import StakingPage from './StakingPage';

export const metadata: Metadata = createMetadata(
  'Anchoring | Cosmic Signature',
  'Anchor your Cosmic Signature NFTs to the protocol to receive per-cycle ETH Anchor Distributions. View global anchoring statistics and how the mechanism works on Arbitrum.',
  undefined,
  '/anchoring',
);

export default function Page() {
  return <StakingPage />;
}
