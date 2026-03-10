import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import Mint from './Mint';

export const metadata: Metadata = createMetadata(
  'Mint | Cosmic Signature',
  'Mint a Random Walk NFT on Cosmic Signature.',
);

export default function Page() {
  return <Mint />;
}
