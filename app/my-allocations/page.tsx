import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyWinnings from './MyWinnings';

export const metadata: Metadata = createMetadata(
  'My Allocations | Cosmic Signature',
  'View and retrieve your pending ETH allocations, Stellar Selection distributions, Anchor Distributions, and attached assets from the Cosmic Signature protocol.',
  undefined,
  '/my-allocations',
);

export default function Page() {
  return <MyWinnings />;
}
