import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createMetadata } from '@/utils/seo';

import SystemEventPage from './SystemEventPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; round: string; start: string; end: string }>;
}): Promise<Metadata> {
  const { locale, round, start, end } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('systemEvent.title'),
    t('systemEvent.description'),
    undefined,
    `/system-event/${round}/${start}/${end}`,
    { index: false, locale },
  );
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; round: string; start: string; end: string }>;
}) {
  const { locale, round, start, end } = await params;
  setRequestLocale(locale);
  return <SystemEventPage round={Number(round)} start={Number(start)} end={Number(end)} />;
}
