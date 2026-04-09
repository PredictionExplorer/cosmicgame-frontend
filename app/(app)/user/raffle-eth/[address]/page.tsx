import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UserRaffleETHPage from './UserRaffleETHPage';

export const metadata: Metadata = createMetadata(
  'Raffle ETH User Won | Cosmic Signature',
  'View all ETH raffle prizes won by this user in the Cosmic Signature game. Track raffle winnings across completed rounds.',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <UserRaffleETHPage address={address} />;
}
