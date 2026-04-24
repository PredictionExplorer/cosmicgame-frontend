import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import RewardsByTokenPage from './RewardsByTokenPage';

export const metadata: Metadata = createMetadata(
  'Distributions By Token | Cosmic Signature',
  'Anchor Distribution details for a specific Cosmic Signature NFT \u2014 per-cycle ETH distribution history, retrieval status, and cumulative allocations.',
);

export default async function Page({
  params,
}: {
  params: Promise<{ address: string; tokenId: string }>;
}) {
  const { address, tokenId } = await params;
  return <RewardsByTokenPage address={address} tokenId={Number(tokenId)} />;
}
