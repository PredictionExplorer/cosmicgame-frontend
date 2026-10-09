import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { SnapshotStamp } from '@/components/layout/SnapshotStamp';
import { cn } from '@/lib/utils';

import { DashboardFigure } from '../DashboardFigure';
import { dashboardSeed, type DashboardMetric } from '../dashboardMetrics';
import { readDashboard } from '../publicDataReads';

/** One fact of the header's facts line. */
interface GalleryFact {
  id: string;
  label: string;
  /** The label on a phone ("Imprinted"); without one the fact shows from `sm` only. */
  shortLabel?: string;
  /** The live dashboard metric the fact shows. */
  metric: DashboardMetric;
}

/**
 * The collection's figures as one quiet wall-label line under the lede
 * ("Imprinted NFTs 48 · Anchored NFTs 33 · …") rather than a row of large
 * figures: on the gallery the art is the headline, and a figure row pushed
 * the first plates below a laptop's first screen. A phone keeps it to one
 * line ("Imprinted 48 · Anchored 33 · Named 3").
 */
function GalleryFacts({
  facts,
  seed,
}: {
  facts: GalleryFact[];
  /** The server's value of a metric; undefined when its read failed. */
  seed: (metric: DashboardMetric) => number | null | undefined;
}) {
  return (
    <dl
      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 sm:gap-x-5"
      data-testid="gallery-facts"
    >
      {facts.map((fact) => (
        <div
          key={fact.id}
          data-figure={fact.id}
          className={cn('flex items-baseline gap-1.5', !fact.shortLabel && 'max-sm:hidden')}
        >
          <dt className="type-label text-subtle">
            {fact.shortLabel ? (
              <>
                <span className="sm:hidden">{fact.shortLabel}</span>
                <span className="max-sm:hidden">{fact.label}</span>
              </>
            ) : (
              fact.label
            )}
          </dt>
          <dd className="type-label font-medium tabular-nums text-foreground">
            {/* The server's count in the HTML; a failed server read is read again in the browser. */}
            <DashboardFigure metric={fact.metric} seed={seed(fact.metric)} inline />
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
 * first screen of a 1280 × 720 laptop and the top of a phone's first screen
 * (a one-line fact row, no snapshot or marketplace button there); the
 * related pages and the marketplace sit in "About the collection" after the
 * wall (GalleryAbout).
 */
export async function GallerySeoSummary({ actions }: { actions?: ReactNode } = {}) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const dashboard = await readDashboard();

  return (
    <PageHeader
      section="collection"
      sectionHub
      title={t('gallerySummary.heading')}
      titleId="gallery-heading"
      subtitle={t('gallerySummary.description')}
      actions={actions}
      // On a phone the marketplace action's slot goes (it waits in "About the
      // collection"), and the header tightens, so the first plates start in
      // the top half of the first screen.
      className="mb-4 pb-4 sm:mb-5 sm:pb-6 max-sm:[&_[data-slot=page-header-actions]]:hidden"
    >
      {/* Closer to the lede than the header's meta line: one short label. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 type-caption text-subtle sm:mt-4">
        <GalleryFacts
          seed={(metric) => dashboardSeed(dashboard.data, metric)}
          facts={[
            {
              id: 'imprinted',
              label: t('gallerySummary.cards.imprinted'),
              shortLabel: t('gallerySummary.cardsShort.imprinted'),
              metric: 'imprinted',
            },
            {
              id: 'anchored',
              label: t('gallerySummary.cards.anchored'),
              shortLabel: t('gallerySummary.cardsShort.anchored'),
              metric: 'anchored',
            },
            {
              id: 'named',
              label: t('gallerySummary.cards.named'),
              shortLabel: t('gallerySummary.cardsShort.named'),
              metric: 'named',
            },
            {
              // Cycles are numbered from 0, so the current one's number is how many have finalized.
              id: 'cycles',
              label: t('gallerySummary.cards.cycles'),
              metric: 'cycle',
            },
          ]}
        />
        {/* From `sm`: a phone keeps the facts to one line above the art. */}
        {dashboard.data ? <SnapshotStamp at={dashboard.at} className="max-sm:hidden" /> : null}
      </div>
    </PageHeader>
  );
}
