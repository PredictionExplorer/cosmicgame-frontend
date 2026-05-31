import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonationByRoundPage from './EthDonationByRoundPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ round: string }>;
}): Promise<Metadata> {
  const { round } = await params;
  return createMetadata(
    'Direct ETH Contributions by Cycle | Cosmic Signature',
    'Direct ETH contributions to the Cosmic Signature protocol broken down by Performance Cycle.',
    undefined,
    `/eth-contribution/round/${round}`,
    { index: false },
  );
}

export default async function Page({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  return <EthDonationByRoundPage round={Number(round)} />;
}
