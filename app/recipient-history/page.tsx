import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import WinningHistory from './WinningHistory';

export const metadata: Metadata = createMetadata(
  'My Allocation History | Cosmic Signature',
  'View your complete allocation history in Cosmic Signature, including Signature Allocations, ETH Stellar Selection distributions, Cosmic Signature NFTs, and Anchor Distributions.',
  undefined,
  '/recipient-history',
);

export default function Page() {
  return <WinningHistory />;
}
