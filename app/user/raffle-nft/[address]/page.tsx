import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UserRaffleNFTPage from './UserRaffleNFTPage';

export const metadata: Metadata = createMetadata(
  'Raffle NFT User Won | Cosmic Signature',
  'View all NFT raffle prizes won by this user in the Cosmic Signature game. Browse COSMIC NFTs earned through raffle drawings.',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <UserRaffleNFTPage address={address} />;
}
