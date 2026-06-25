import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyTokens from './MyTokens';

export const metadata: Metadata = createMetadata(
  'My NFTs | Cosmic Signature',
  'View and manage the Cosmic Signature NFTs in your connected wallet, including optional transfers to another address.',
  undefined,
  '/my-tokens',
  { index: false },
);

export default function Page() {
  return <MyTokens />;
}
