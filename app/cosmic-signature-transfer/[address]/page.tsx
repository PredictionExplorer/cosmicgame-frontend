import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CosmicSignatureTransfersPage from './CosmicSignatureTransfersPage';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Token Transfer History | Cosmic Signature',
  'Cosmic Signature Token Transfer History',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <CosmicSignatureTransfersPage address={address} />;
}
