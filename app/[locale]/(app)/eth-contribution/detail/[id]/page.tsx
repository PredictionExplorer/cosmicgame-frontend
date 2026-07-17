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

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EthDonationDetailPage id={Number(id)} />;
}
