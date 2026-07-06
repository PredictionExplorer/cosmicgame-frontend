import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import RewardsByTokenPage from './RewardsByTokenPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string; tokenId: string }>;
}): Promise<Metadata> {
  const { address, tokenId } = await params;
  return createMetadata(
    'Distributions By Token | Cosmic Signature',
    'Anchor Distribution details for a specific Cosmic Signature NFT \u2014 per-cycle ETH distribution history, retrieval status, and cumulative allocations.',
    undefined,
    `/distributions-by-token/${address}/${tokenId}`,
    { index: false },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ address: string; tokenId: string }>;
}) {
  const { address, tokenId } = await params;
  return <RewardsByTokenPage address={address} tokenId={Number(tokenId)} />;
}
