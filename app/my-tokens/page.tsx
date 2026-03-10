import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import MyTokens from './MyTokens';

export const metadata: Metadata = createMetadata(
  'My Tokens | Cosmic Signature',
  'Manage your digital assets on the My Tokens page at Cosmic Signature. View your token balance, transaction history, and ownership details. Keep track of your NFTs and tokens effortlessly.',
);

export default function Page() {
  return <MyTokens />;
}
