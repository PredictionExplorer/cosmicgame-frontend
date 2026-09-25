'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';

import { FinalizedSignatureSkeleton } from './FinalizedSignatureSkeleton';
import { parseFinalizedSearch } from './finalizedSearch';
import { FINALIZED_INDEX_FIGURES, FINALIZED_INDEX_LINKS } from './finalizedIndexSummary';
import {
  FinalizedIndexSection,
  FinalizedIndexSkeleton,
  FinalizedRecordHeader,
} from './finalizedShell';

/** A figure's value while it loads: one line of its slot tall, as the header draws it. */
const PENDING_FIGURE = (
  <span aria-hidden className="flex h-[1lh] items-center">
    <Skeleton as="span" className="block h-6 w-20 lg:h-8" />
  </span>
);

/**
 * The index's header while its figures load: the summary header the page
 * lands with (its heading, lede, figure labels and related pages, from
 * `finalizedIndexSummary`), the figures and the snapshot line held in place.
 */
function FinalizedIndexLoadingHeader() {
  const t = useTranslations('seo');
  const route = (key: string) => t(`publicData.routes.allocation-finalized.${key}`);
  const heading = route('heading');
  return (
    <PageHeader
      section="records"
      title={heading}
      subtitle={route('description')}
      figures={FINALIZED_INDEX_FIGURES.map(({ key, tooltip }) => ({
        id: key,
        label: route(`cards.${key}.label`),
        value: PENDING_FIGURE,
        info: tooltip ? route(`cards.${key}.tooltip`) : undefined,
      }))}
      meta={<Skeleton as="span" aria-hidden className="block h-3.5 w-40" />}
      related={FINALIZED_INDEX_LINKS.map(({ href, key }) => ({
        href,
        label: route(`links.${key}`),
      }))}
      relatedLabel={t('publicData.common.relatedPagesAria', { heading })}
    />
  );
}

/**
 * The page while the server renders it, in the state it lands in: a cycle's
 * record under its own header (the trail, "Cycle 5 Signature Allocation",
 * its lede) over the plate and the spec sheet, or the index under its
 * summary header (the figures still on their way) over the latest cycles'
 * cards. The query decides which, as it decides the
 * page, read here in the browser.
 */
export function FinalizedLoading() {
  const t = useTranslations('allocation');
  const { cycle } = parseFinalizedSearch(Object.fromEntries(useSearchParams().entries()));
  return (
    <PageShell variant="data" backdrop="signature">
      {cycle === null ? (
        <>
          <FinalizedIndexLoadingHeader />
          <FinalizedIndexSection>
            <FinalizedIndexSkeleton />
          </FinalizedIndexSection>
        </>
      ) : (
        <>
          <FinalizedRecordHeader cycle={cycle} />
          <FinalizedSignatureSkeleton label={t('finalized.loading.status')} />
        </>
      )}
    </PageShell>
  );
}
