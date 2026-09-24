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
  const t = await getTranslations({ locale, namespace: 'coordination' });
  // The tab names the window by its cycle, as the H1 does.
  const cycle = Number(round);
  const valid = Number.isSafeInteger(cycle) && cycle >= 0;
  const initial = valid && cycle === 0;
  return createPageMetadata(
    parent,
    !valid
      ? t('systemEvent.invalidTitle')
      : initial
        ? t('systemEvent.titleInitial')
        : t('systemEvent.title', { cycle }),
    !valid
      ? t('systemEvent.invalidDescription')
      : initial
        ? t('systemEvent.ledeInitial')
        : t('systemEvent.lede', { cycle }),
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
