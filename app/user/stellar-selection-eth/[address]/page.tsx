import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import UserRaffleETHPage from './UserRaffleETHPage';

export const metadata: Metadata = createMetadata(
  'Stellar Selection ETH | Cosmic Signature',
  'All ETH allocations this participant received through Stellar Selection. Track random-selection allocations across completed cycles.',
);

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <UserRaffleETHPage address={address} />;
}
