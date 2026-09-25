import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../../../QuerySeed';

import SystemEventPage from './SystemEventPage';
import { checkSystemEventWindow } from './systemEventLink';
import { readSystemEventsSeed } from './systemEventsSeed';
import { isValidWindow } from './systemEventWindow';

/** The window a link names, from its three segments. */
function linkedWindow({ round, start, end }: { round: string; start: string; end: string }) {
  return { round: Number(round), start: Number(start), end: Number(end) };
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; round: string; start: string; end: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, round, start, end } = await params;
  const window = linkedWindow({ round, start, end });
  const [t, tCoordination, check] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'coordination' }),
    checkSystemEventWindow(window.round, window.start, window.end),
  ]);
  const path = `/system-event/${round}/${start}/${end}`;
  // A window that does not exist says so in its tab, as its H1 does.
  if (check.status === 'missing' || !isValidWindow(window)) {
    return createPageMetadata(
      parent,
      tCoordination('systemEvent.invalidTitle'),
      tCoordination('systemEvent.invalidDescription'),
      undefined,
      path,
      { index: false, locale },
    );
  }
  // The tab names the window by its cycle, as the H1 does.
  const initial = round === '0';
  return createPageMetadata(
    parent,
    initial ? t('systemEvent.titleInitial') : t('systemEvent.title', { cycle: round }),
    initial ? t('systemEvent.descriptionInitial') : t('systemEvent.description', { cycle: round }),
    undefined,
    path,
    { index: false, locale },
  );
}

/**
 * No window renders at build time: each renders on its first visit and is
 * then served from the cache. A window closes when its cycle opens, so its
 * changes are final and its render keeps a day (`CACHE_WINDOW.final`); a
 * cycle with no window yet, or a render whose reads failed, keeps a minute.
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
  const window = linkedWindow({ round, start, end });
  const check = await checkSystemEventWindow(window.round, window.start, window.end);
  // A cycle with no window: the window's not-found state, rendered here on the server (a
  // segment's notFound() reaches the browser as the bare error shell) and kept a minute.
  if (check.status === 'missing') {
    await capCacheWindow('pending');
    return (
      <PageMessages namespaces={['coordination', 'statistics', 'tables']}>
        <SystemEventPage {...window} missing />
      </PageMessages>
    );
  }
  // The window's first read, so its changes are in the HTML (no layout shift).
  const seeds = await readSystemEventsSeed(window);
  await capCacheWindow(seeds.length > 0 && check.status === 'canonical' ? 'final' : 'pending');
  return (
    <PageMessages namespaces={['coordination', 'statistics', 'tables']}>
      <QuerySeed seeds={seeds}>
        <SystemEventPage {...window} />
      </QuerySeed>
    </PageMessages>
  );
}
