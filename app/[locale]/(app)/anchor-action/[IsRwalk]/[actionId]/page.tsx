import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

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
  return (
    <PageMessages namespaces={['anchoring', 'tables', 'traits']}>
      <QuerySeed seeds={await readAnchorActionSeeds(parsed)}>
        <AnchorActionDetailPage IsRwalk={parsed.isRwalk} actionId={parsed.actionId} />
      </QuerySeed>
    </PageMessages>
  );
}
