import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import SystemEventPage from './SystemEventPage';

export const metadata: Metadata = createMetadata(
  'Admin Events | Cosmic Signature',
  'View system administration events and parameter changes for a specific Cosmic Signature game round.',
);

export default async function Page({
  params,
}: {
  params: Promise<{ round: string; start: string; end: string }>;
}) {
  const { round, start, end } = await params;
  return <SystemEventPage round={Number(round)} start={Number(start)} end={Number(end)} />;
}
