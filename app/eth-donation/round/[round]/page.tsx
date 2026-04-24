import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonationByRoundPage from './EthDonationByRoundPage';

export const metadata: Metadata = createMetadata(
  'Direct ETH Contributions by Cycle | Cosmic Signature',
  'Direct ETH contributions to the Cosmic Signature protocol broken down by Performance Cycle.',
);

export default async function Page({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  return <EthDonationByRoundPage round={Number(round)} />;
}
