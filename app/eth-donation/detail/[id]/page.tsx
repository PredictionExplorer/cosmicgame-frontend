import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonationDetailPage from './EthDonationDetailPage';

export const metadata: Metadata = createMetadata(
  'Direct (ETH) Donation Detail | Cosmic Signature',
  'Direct (ETH) Donation Detail',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EthDonationDetailPage id={Number(id)} />;
}
