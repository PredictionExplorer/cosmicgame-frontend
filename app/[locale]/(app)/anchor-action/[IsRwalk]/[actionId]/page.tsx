import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../../QuerySeed';

import AnchorActionDetailPage from './AnchorActionDetailPage';
import { readAnchorActionSeeds } from './anchorActionReads';
import { parseAnchorActionParams } from './params';

interface PageProps {
  params: Promise<{ locale: string; IsRwalk: string; actionId: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale, IsRwalk, actionId: rawActionId } = await params;
  const parsed = parseAnchorActionParams(IsRwalk, rawActionId);
  if (parsed === null) notFound();
  const { actionId } = parsed;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const tAnchoring = await getTranslations({ locale, namespace: 'anchoring' });
  return createPageMetadata(
    parent,
    // Titled like its H1 ("Anchor action #23"), so every action's tab says which one it is.
    tAnchoring('anchorActionDetail.title', { id: actionId }),
    t('anchorAction.description'),
    undefined,
    `/anchor-action/${IsRwalk}/${actionId}`,
    { index: false, locale },
  );
}

/**
 * No action renders at build time: each record renders on its first visit
 * and is then served from the cache. A released anchor's record is final
 * and keeps a day (`CACHE_WINDOW.final`); one still held keeps five minutes,
 * and a missing record or a failed read a minute (`readAnchorActionSeeds`).
 */
export function generateStaticParams() {
  return [];
}

export const revalidate = 86400;

/**
 * One anchor action's public record. The segments are validated first (the
 * layout already answered a bad one with a 404), and the record is read on
 * the server, so its first HTML is the record, not a skeleton.
 */
export default async function Page({ params }: PageProps) {
  const { locale, IsRwalk, actionId } = await params;
  setRequestLocale(locale);
  const parsed = parseAnchorActionParams(IsRwalk, actionId);
  if (parsed === null) notFound();
  const { seeds, cacheWindow } = await readAnchorActionSeeds(parsed);
  await capCacheWindow(cacheWindow);
  return (
    <PageMessages namespaces={['anchoring', 'tables', 'traits']}>
      <QuerySeed seeds={seeds}>
        <AnchorActionDetailPage IsRwalk={parsed.isRwalk} actionId={parsed.actionId} />
      </QuerySeed>
    </PageMessages>
  );
}
