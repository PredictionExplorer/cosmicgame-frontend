import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import PrizeInfoPage from './PrizeInfoPage';

export const metadata: Metadata = createMetadata(
  'Prize Information | Cosmic Signature',
  'Prize Information',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PrizeInfoPage roundNum={parseInt(id, 10)} />;
}
