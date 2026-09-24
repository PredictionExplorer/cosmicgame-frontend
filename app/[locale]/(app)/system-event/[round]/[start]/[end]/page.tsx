import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import SystemEventPage from './SystemEventPage';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; round: string; start: string; end: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, round, start, end } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
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
  return (
    <PageMessages namespaces={['coordination', 'statistics', 'tables']}>
      <SystemEventPage round={Number(round)} start={Number(start)} end={Number(end)} />
    </PageMessages>
  );
}
