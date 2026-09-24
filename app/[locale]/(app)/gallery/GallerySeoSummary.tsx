import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { SnapshotStamp } from '@/components/layout/SnapshotStamp';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatCount } from '@/utils/format';

import { readDashboard } from '../publicDataReads';

/**
 * The gallery header, rendered on the server: the collection hub's H1, lede,
 * one figure row (imprinted, anchored, named) and related pages. It is the
 * page's only header; the gallery renders it first.
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
      ]}
      meta={dashboard.data ? <SnapshotStamp at={dashboard.at} /> : undefined}
      related={[
        { href: '/how-it-works', label: t('gallerySummary.links.learn') },
        { href: '/code', label: t('gallerySummary.links.code') },
        { href: '/statistics', label: t('gallerySummary.links.statistics') },
      ]}
      relatedLabel={t('gallerySummary.relatedAria')}
    />
  );
}
