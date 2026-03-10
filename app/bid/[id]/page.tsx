import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import BidPage from './BidPage';

export const metadata: Metadata = createMetadata(
  'Bid Information | Cosmic Signature',
  'Bid Information',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BidPage bidId={parseInt(id, 10)} />;
}
