import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UserRaffleETHPage from './UserRaffleETHPage';

export const metadata: Metadata = createMetadata(
  'Raffle ETH User Won | Cosmic Signature',
  'Raffle ETH User Won',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <UserRaffleETHPage address={address} />;
}
