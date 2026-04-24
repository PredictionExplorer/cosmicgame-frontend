import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import PrizeInfoPage from './PrizeInfoPage';

export const metadata: Metadata = createMetadata(
  'Allocation Information | Cosmic Signature',
  'Detailed allocation information for a Cosmic Signature cycle \u2014 recipient details, Signature Allocation distribution, Stellar Selection results, and attached NFT allocations.',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PrizeInfoPage roundNum={parseInt(id, 10)} />;
}
