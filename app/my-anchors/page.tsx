import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyStaking from './MyStaking';

export const metadata: Metadata = createMetadata(
  'My Anchors | Cosmic Signature',
  'Manage your anchored NFTs on Cosmic Signature. View your anchor status, Anchor Distributions, and history across each Performance Cycle.',
  undefined,
  '/my-anchors',
);

export default function Page() {
  return <MyStaking />;
}
