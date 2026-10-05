'use client';

import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PendingPlate } from '@/components/ui/art-frame';
import { buttonVariants } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';

/*
 * The parts of /allocation-finalized that stand before its data: the headers
 * and the index's frame. The page and its loading boundary draw them from
 * here, so a navigation's loading state is the page as it will land.
 */

/** How many finalized cycles the page shows when no cycle is named. */
export const INDEX_CYCLES = 3;

type AllocationT = ReturnType<typeof useTranslations<'allocation'>>;

/** A cycle's trail: the allocation recipients, then the cycle's own record. */
export function finalizedTrail(t: AllocationT, cycle: number) {
  return [
    { label: t('details.breadcrumbs.recipients'), href: '/allocation' },
    { label: t('formats.cycle', { cycle }), href: `/allocation/${cycle}` },
  ];
}

/**
 * The neutral record's header: the loading and error states keep it, so the
 * record lands under the same title and lede.
 */
export function FinalizedRecordHeader({ cycle }: { cycle: number }) {
  const t = useTranslations('allocation');
  return (
    <PageHeader
      section="records"
      breadcrumbs={finalizedTrail(t, cycle)}
      title={t('finalized.result.title', { cycle })}
      subtitle={t('finalized.result.lede')}
    />
  );
}

/** The index's header, without a cycle named, when the page has no summary to show. */
export function FinalizedIndexHeader() {
  const t = useTranslations('allocation');
  return (
    <PageHeader
      section="records"
      title={t('finalized.title')}
      subtitle={t('finalized.index.description')}
    />
  );
}

/** The index's section: its heading and the way to every cycle, over `children`. */
export function FinalizedIndexSection({ children }: { children: ReactNode }) {
  const t = useTranslations('allocation');
  return (
    <section aria-labelledby="finalized-index">
      <SectionHeader
        headingId="finalized-index"
        title={t('finalized.index.title')}
        description={t('finalized.index.description')}
        actions={
          <Link href="/allocation" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            {t('finalized.links.allCycles')}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      />
      {children}
    </section>
  );
}

/** The index's cards while the cycle list loads, in the grid they land in. */
export function FinalizedIndexSkeleton() {
  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
      {Array.from({ length: INDEX_CYCLES }, (_, index) => (
        <li key={index} className="flex flex-col gap-3">
          <PendingPlate busy density="compact" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-3/5" />
        </li>
      ))}
    </ul>
  );
}
