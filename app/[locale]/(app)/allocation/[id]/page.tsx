import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import AllocationInfoPage from './AllocationInfoPage';

export const metadata: Metadata = createMetadata(
  'Allocation Information | Cosmic Signature',
  'Detailed allocation information for a Cosmic Signature cycle \u2014 recipient details, Signature Allocation distribution, Stellar Selection results, and attached NFT allocations.',
);

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AllocationInfoPage roundNum={parseInt(id, 10)} />;
}
