import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UserStellarSelectionNFTPage from './UserStellarSelectionNFTPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  return createMetadata(
    'Stellar Selection NFTs | Cosmic Signature',
    'All Cosmic Signature NFTs allocated to this participant through Stellar Selection. Browse NFTs received via on-chain random selection.',
    undefined,
    `/user/stellar-selection-nft/${address}`,
    { index: false },
  );
}

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <UserStellarSelectionNFTPage address={address} />;
}
