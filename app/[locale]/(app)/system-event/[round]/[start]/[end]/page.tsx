import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../../../QuerySeed';

import SystemEventPage from './SystemEventPage';
import { readSystemEventsSeed } from './systemEventsSeed';

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; round: string; start: string; end: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, round, start, end } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  // The tab names the window by its cycle, as the H1 does.
  const initial = round === '0';
  return createPageMetadata(
    parent,
    initial ? t('systemEvent.titleInitial') : t('systemEvent.title', { cycle: round }),
    initial ? t('systemEvent.descriptionInitial') : t('systemEvent.description', { cycle: round }),
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
  const window = { round: Number(round), start: Number(start), end: Number(end) };
  // The window's first read, so its changes are in the HTML (no layout shift).
  const seeds = await readSystemEventsSeed(window);
  return (
    <PageMessages namespaces={['coordination', 'statistics', 'tables']}>
      <QuerySeed seeds={seeds}>
        <SystemEventPage {...window} />
      </QuerySeed>
    </PageMessages>
  );
}
