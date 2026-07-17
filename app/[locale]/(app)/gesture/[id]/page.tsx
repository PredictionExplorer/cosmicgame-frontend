import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import GesturePage from './GesturePage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return createMetadata(
    'Gesture Information | Cosmic Signature',
    'View detailed gesture information including timestamp, participant address, gesture cost, and cycle context for the Cosmic Signature protocol.',
    undefined,
    `/gesture/${id}`,
    { index: false },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GesturePage gestureId={parseInt(id, 10)} />;
}
