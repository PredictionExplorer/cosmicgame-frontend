import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CodeViewer from './CodeViewer';

export const metadata: Metadata = createMetadata(
  'Code | Cosmic Signature',
  'View and explore the open-source code behind Cosmic Signature. The generative NFT art is created from on-chain seeds using a Rust program based on three-body problem physics.',
  undefined,
  '/code',
);

export default function Page() {
  return <CodeViewer />;
}
