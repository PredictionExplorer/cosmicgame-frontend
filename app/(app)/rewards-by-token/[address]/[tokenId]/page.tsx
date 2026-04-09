import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import RewardsByTokenPage from './RewardsByTokenPage';

export const metadata: Metadata = createMetadata(
  'Rewards Details By Token | Cosmic Signature',
  'View staking reward details for a specific Cosmic Signature token, including ETH distributions, reward history, and cumulative earnings.',
);

export default async function Page({
  params,
}: {
  params: Promise<{ address: string; tokenId: string }>;
}) {
  const { address, tokenId } = await params;
  return <RewardsByTokenPage address={address} tokenId={Number(tokenId)} />;
}
