import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MintArtBlocks from './MintArtBlocks';

export const metadata: Metadata = createMetadata(
  'Mint Art Blocks | Cosmic Signature',
  'Mint an Art Blocks NFT on Cosmic Signature.',
);

export default function Page() {
  return <MintArtBlocks />;
}
