import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyAnchors from './MyAnchors';

export const metadata: Metadata = createMetadata(
  'My Anchors | Cosmic Signature',
  'Manage your anchored Cosmic Signature and Random Walk NFTs. View ETH Anchor Distributions for Cosmic Signature NFTs and Anchored-NFT Stellar Selection history for Random Walk NFTs.',
  undefined,
  '/my-anchors',
  { index: false },
);

export default function Page() {
  return <MyAnchors />;
}
