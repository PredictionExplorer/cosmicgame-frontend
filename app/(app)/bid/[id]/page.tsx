import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import BidPage from './BidPage';

export const metadata: Metadata = createMetadata(
  'Bid Information | Cosmic Signature',
  'View detailed bid information including timestamp, bidder address, bid amount, and round context for the Cosmic Signature bidding game.',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BidPage bidId={parseInt(id, 10)} />;
}
