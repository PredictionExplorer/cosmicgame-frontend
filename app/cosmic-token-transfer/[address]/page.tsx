import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CosmicTokenTransfersPage from './CosmicTokenTransfersPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  return createMetadata(
    'Cosmic Signature CST Token Transfer History | Cosmic Signature',
    'Cosmic Signature CST Token Transfer History',
    undefined,
    `/cosmic-token-transfer/${address}`,
    { index: false },
  );
}

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <CosmicTokenTransfersPage address={address} />;
}
