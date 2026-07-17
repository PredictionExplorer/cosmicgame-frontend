import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';

import UsedRwlkNftsPage from './UsedRwlkNftsPage';

export const metadata: Metadata = createMetadata(
  'Used RandomWalk NFTs | Cosmic Signature',
  'RandomWalk NFTs already attached to ETH gestures for a 50% Gesture-Cost discount in Cosmic Signature. Each RandomWalk NFT can be used once for this discount.',
  undefined,
  '/used-rwlk-nfts',
);

export const revalidate = 300;

export default function Page() {
  return (
    <>
      <PublicDataRouteSeoSummary route="used-rwlk-nfts" />
      <UsedRwlkNftsPage />
    </>
  );
}
