import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import EthDonationByRoundPage from './EthDonationByRoundPage';

export const metadata: Metadata = createMetadata(
  'Direct (ETH) Donations by Round | Cosmic Signature',
  'View Direct (ETH) Donations by Round',
);

export default async function Page({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;
  return <EthDonationByRoundPage round={Number(round)} />;
}
