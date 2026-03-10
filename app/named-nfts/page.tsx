import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import NamedNFTsPage from './NamedNFTsPage';

export const metadata: Metadata = createMetadata(
  'Named Cosmic Signature Tokens | Cosmic Signature',
  'Named Cosmic Signature Tokens',
);

export default function Page() {
  return <NamedNFTsPage />;
}
