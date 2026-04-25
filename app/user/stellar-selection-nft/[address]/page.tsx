import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UserStellarSelectionNFTPage from './UserStellarSelectionNFTPage';

export const metadata: Metadata = createMetadata(
  'Stellar Selection NFTs | Cosmic Signature',
  'All Cosmic Signature NFTs allocated to this participant through Stellar Selection. Browse NFTs received via on-chain random selection.',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <UserStellarSelectionNFTPage address={address} />;
}
