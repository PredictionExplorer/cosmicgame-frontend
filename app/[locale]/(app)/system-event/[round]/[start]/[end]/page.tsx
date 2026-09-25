import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { readSystemModes } from '../../../../publicDataReads';
import { QuerySeed, seedsDisabled } from '../../../../QuerySeed';

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

/**
 * No window renders at build time: each renders on its first visit and is
 * then served from the cache. A window closes when its cycle opens, so its
 * changes are final and its render keeps a day (`CACHE_WINDOW.final`); one
 * whose reads failed keeps a minute.
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 86400;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; round: string; start: string; end: string }>;
}) {
  const { locale, round, start, end } = await params;
  setRequestLocale(locale);
  const window = { round: Number(round), start: Number(start), end: Number(end) };
  // The window's first read, so its changes are in the HTML (no layout shift).
  const [seeds, modes] = await Promise.all([
    readSystemEventsSeed(window),
    seedsDisabled() ? null : readSystemModes(),
  ]);
  // The layout checked the window against the mode list, unless the list could not be read.
  await capCacheWindow(seeds.length > 0 && modes?.data ? 'final' : 'pending');
  return (
    <PageMessages namespaces={['coordination', 'statistics', 'tables']}>
      <QuerySeed seeds={seeds}>
        <SystemEventPage {...window} />
      </QuerySeed>
    </PageMessages>
  );
}
