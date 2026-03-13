import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonationDetailPage from './EthDonationDetailPage';

export const metadata: Metadata = createMetadata(
  'Direct (ETH) Donation Detail | Cosmic Signature',
  'View detailed information about a specific ETH donation to the Cosmic Signature charity pool, including donor address, amount, round, and optional message.',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EthDonationDetailPage id={Number(id)} />;
}
