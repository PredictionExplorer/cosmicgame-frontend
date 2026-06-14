import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import CosmicSignatureTransfersPage from './CosmicSignatureTransfersPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  return createMetadata(
    'Cosmic Signature NFT Transfer History | Cosmic Signature',
    'Cosmic Signature NFT Transfer History',
    undefined,
    `/cosmic-signature-transfer/${address}`,
    { index: false },
  );
}

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <CosmicSignatureTransfersPage address={address} />;
}
