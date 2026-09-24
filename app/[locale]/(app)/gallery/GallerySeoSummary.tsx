import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { SnapshotStamp } from '@/components/layout/SnapshotStamp';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatCount } from '@/utils/format';

import { readDashboard } from '../publicDataReads';

/**
 * The gallery header, rendered on the server: the collection hub's H1, a
 * one-sentence lede and one figure row (imprinted, anchored, named, finalized
 * cycles: a 2 × 2 grid on phones). It is the page's only header, and it stays
 * short so the first plates reach the first screen; the related pages sit in
 * "About the collection" after the wall (GalleryAbout).
 */
export async function GallerySeoSummary({ actions }: { actions?: ReactNode } = {}) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const dashboard = await readDashboard();
  const stats = dashboard.data?.MainStats;
  const count = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? null : formatCount(numeric, locale);
  };

  return (
    <PageHeader
      section="collection"
      sectionHub
      title={t('gallerySummary.heading')}
      titleId="gallery-heading"
      subtitle={t('gallerySummary.description')}
      actions={actions}
      figures={[
        {
          id: 'imprinted',
          label: t('gallerySummary.cards.imprinted'),
          value: count(stats?.NumCSTokenMints),
        },
        {
          id: 'anchored',
          label: t('gallerySummary.cards.anchored'),
          value: count(stats?.StakeStatisticsCST?.TotalTokensStaked),
        },
        {
          id: 'named',
          label: t('gallerySummary.cards.named'),
          value: count(stats?.TotalNamedTokens),
        },
        {
          // Cycles are numbered from 0, so the current one's number is how many have finalized.
          id: 'cycles',
          label: t('gallerySummary.cards.cycles'),
          value: count(dashboard.data?.CurRoundNum),
        },
      ]}
      meta={dashboard.data ? <SnapshotStamp at={dashboard.at} /> : undefined}
    />
  );
}
