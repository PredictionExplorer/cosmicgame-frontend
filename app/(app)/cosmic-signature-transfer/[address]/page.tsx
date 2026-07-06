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

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <CosmicSignatureTransfersPage address={address} />;
}
