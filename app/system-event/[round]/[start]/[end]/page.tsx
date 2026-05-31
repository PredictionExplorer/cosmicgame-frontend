import type { Metadata } from 'next';

import { createMetadata } from '@/utils/seo';

import SystemEventPage from './SystemEventPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ round: string; start: string; end: string }>;
}): Promise<Metadata> {
  const { round, start, end } = await params;
  return createMetadata(
    'System Events | Cosmic Signature',
    'Protocol administration events and coordination parameter changes for a specific Cosmic Signature cycle.',
    undefined,
    `/system-event/${round}/${start}/${end}`,
    { index: false },
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ round: string; start: string; end: string }>;
}) {
  const { round, start, end } = await params;
  return <SystemEventPage round={Number(round)} start={Number(start)} end={Number(end)} />;
}
