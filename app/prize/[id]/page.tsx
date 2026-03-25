import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import PrizeInfoPage from './PrizeInfoPage';

export const metadata: Metadata = createMetadata(
  'Prize Information | Cosmic Signature',
  'Detailed prize information for a Cosmic Signature game round — winner details, ETH prize distribution, raffle results, and NFT rewards.',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PrizeInfoPage roundNum={parseInt(id, 10)} />;
}
