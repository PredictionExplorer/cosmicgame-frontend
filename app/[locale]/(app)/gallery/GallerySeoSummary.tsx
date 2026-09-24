import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { SnapshotStamp } from '@/components/layout/SnapshotStamp';
import { UnknownValue } from '@/components/ui/unknown-value';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatCount } from '@/utils/format';

import { readDashboard } from '../publicDataReads';

/** One fact of the header's facts line. */
interface GalleryFact {
  id: string;
  label: string;
  /** The formatted count; `null` when the read failed. */
  value: string | null;
}

/**
 * The collection's figures as one quiet wall-label line under the lede
 * ("Imprinted NFTs 48 · Anchored NFTs 33 · …") rather than a row of large
 * figures: on the gallery the art is the headline, and a figure row pushed
 * the first plates below a laptop's first screen.
 */
function GalleryFacts({ facts, unavailable }: { facts: GalleryFact[]; unavailable: string }) {
  return (
    <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1" data-testid="gallery-facts">
      {facts.map((fact) => (
        <div key={fact.id} data-figure={fact.id} className="flex items-baseline gap-1.5">
          <dt className="type-label text-subtle">{fact.label}</dt>
          <dd className="type-label font-medium tabular-nums text-foreground">
            {fact.value === null ? <UnknownValue label={unavailable} /> : fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The gallery header, rendered on the server: the collection hub's H1, a
 * one-sentence lede, and the collection's facts (imprinted, anchored, named,
 * finalized cycles) on one line with the snapshot time. It is the page's
 * only header, and it stays short so the first row of plates reaches the
 * first screen of a 1280 × 720 laptop; the related pages sit in "About the
 * collection" after the wall (GalleryAbout).
 */
export async function GallerySeoSummary({ actions }: { actions?: ReactNode } = {}) {
  const locale = await getLocale();
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'seo' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
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
      className="mb-5 pb-5 sm:mb-5 sm:pb-6"
    >
      {/* Closer to the lede than the header's meta line: one short label. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 type-caption text-subtle sm:mt-4">
        <GalleryFacts
          unavailable={tCommon('status.unavailable')}
          facts={[
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
        />
        {dashboard.data ? <SnapshotStamp at={dashboard.at} /> : null}
      </div>
    </PageHeader>
  );
}
