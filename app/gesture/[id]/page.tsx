import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import GesturePage from './GesturePage';

export const metadata: Metadata = createMetadata(
  'Gesture Information | Cosmic Signature',
  'View detailed gesture information including timestamp, participant address, gesture cost, and cycle context for the Cosmic Signature protocol.',
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GesturePage gestureId={parseInt(id, 10)} />;
}
