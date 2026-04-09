import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CosmicTokenTransfersPage from './CosmicTokenTransfersPage';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Token Transfer History | Cosmic Signature',
  'Cosmic Signature Token Transfer History',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <CosmicTokenTransfersPage address={address} />;
}
