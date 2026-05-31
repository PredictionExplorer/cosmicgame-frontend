import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonationDetailPage from './EthDonationDetailPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return createMetadata(
    'Direct ETH Contribution Detail | Cosmic Signature',
    'Details of a specific ETH contribution to the Cosmic Signature Public Goods Vault \u2014 contributor address, amount, cycle, and optional note.',
    undefined,
    `/eth-contribution/detail/${id}`,
    { index: false },
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EthDonationDetailPage id={Number(id)} />;
}
