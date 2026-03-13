import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MintArtBlocks from './MintArtBlocks';

export const metadata: Metadata = createMetadata(
  'Mint Art Blocks | Cosmic Signature',
  'Mint an Art Blocks NFT through Cosmic Signature. Explore the intersection of generative art and blockchain gaming with exclusive Art Blocks tokens.',
  undefined,
  '/mint-artblocks',
);

export default function Page() {
  return <MintArtBlocks />;
}
