import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { PageShell } from '@/components/ui/page-shell';
import {
  Skeleton,
  SkeletonArtPlate,
  SkeletonDetailRows,
  SkeletonPageHeader,
  SkeletonStatGrid,
  SkeletonTable,
} from '@/components/ui/skeleton';

/**
 * Route-level loading skeletons for the dynamic record pages (`loading.tsx`).
 *
 * A dynamic record route renders on the server on first visit, so without a
 * loading boundary a click on a token, an address or a gesture did nothing
 * visible until the server answered. Each skeleton here keeps the finished
 * page's shell, column and blocks, so the page fills in without moving, and
 * announces "Loading" once.
 */

const panel = 'rounded-surface border border-rule-faint bg-surface/60';

function LoadingRegion({ children, className }: { children: ReactNode; className?: string }) {
  const t = useTranslations('common');
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{t('status.loadingEllipsis')}</span>
      {children}
    </div>
  );
}

/** A detail-page section card: its heading band and spec-sheet rows. */
export function SkeletonSectionCard({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn(panel, 'mb-8 overflow-hidden', className)}>
      <div className="border-b border-rule-faint px-5 py-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <SkeletonDetailRows announce={false} rows={rows} className="px-4 sm:px-5" />
    </div>
  );
}

/**
 * A record read as sections of spec-sheet rows: a gesture, an ETH
 * contribution, an anchor action.
 */
export function RecordDetailSkeleton({
  sections = [3, 2, 2],
  width = 'max-w-3xl',
  shell = 'data',
}: {
  /** Rows per section card, top to bottom. */
  sections?: readonly number[];
  /** The page's own column width. */
  width?: 'max-w-3xl' | 'max-w-5xl';
  shell?: 'data' | 'detail';
}) {
  return (
    <PageShell variant={shell} backdrop="signature" className="max-sm:pb-16">
      <LoadingRegion className={cn('mx-auto', width)}>
        <SkeletonPageHeader />
        {sections.map((rows, i) => (
          <SkeletonSectionCard key={i} rows={rows} />
        ))}
      </LoadingRegion>
    </PageShell>
  );
}

/** A ledger page: header, an optional figure row, and the table. */
export function LedgerPageSkeleton({
  figures = 0,
  summaryRows = 0,
  rows = 10,
  columns = 4,
  width = 'max-w-6xl',
}: {
  figures?: number;
  /** Spec-sheet rows in a summary card above the table. */
  summaryRows?: number;
  rows?: number;
  columns?: number;
  width?: 'max-w-5xl' | 'max-w-6xl' | 'max-w-none';
}) {
  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <LoadingRegion className={cn('mx-auto', width)}>
        <SkeletonPageHeader />
        {figures > 0 ? (
          <SkeletonStatGrid announce={false} count={figures} className="mb-10" />
        ) : null}
        {summaryRows > 0 ? <SkeletonSectionCard rows={summaryRows} /> : null}
        <div className={cn(panel, 'p-2 sm:p-3')}>
          <SkeletonTable announce={false} rows={rows} columns={columns} />
        </div>
      </LoadingRegion>
    </PageShell>
  );
}

/** A Cosmic Signature NFT: the plate beside its wall label, then the figure row. */
export function NftDetailSkeleton() {
  return (
    <PageShell variant="detail" backdrop="signature" className="max-w-none px-0">
      <LoadingRegion className="container mx-auto px-4">
        <Skeleton shine={false} className="mb-6 h-3.5 w-44" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <SkeletonArtPlate />
            <div aria-hidden className="mt-4 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-control" />
                <Skeleton className="h-10 w-36 rounded-control" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="size-10 rounded-control" />
                <Skeleton className="size-10 rounded-control" />
              </div>
            </div>
          </div>
          <div aria-hidden className="space-y-4">
            <Skeleton className="h-11 w-2/3 sm:h-14" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-10 w-48 rounded-control" />
          </div>
        </div>
        <SkeletonStatGrid announce={false} className="mt-10" />
        <div aria-hidden className={cn(panel, 'mt-8 p-4')}>
          <Skeleton shine={false} className="h-3 w-16" />
          <Skeleton className="mt-3 h-3.5 w-full max-w-2xl" />
        </div>
      </LoadingRegion>
    </PageShell>
  );
}

/** A participant's profile: header with the address, six figures, then the activity panel. */
export function ProfileSkeleton() {
  return (
    <PageShell variant="data">
      <LoadingRegion>
        <SkeletonPageHeader breadcrumb={false} className="mb-6" />
        <Skeleton className="mb-10 h-7 w-56 rounded-control" />
        <SkeletonStatGrid announce={false} count={6} className="lg:grid-cols-3" />
        <div aria-hidden className={cn(panel, 'mt-8 p-5')}>
          <Skeleton shine={false} className="h-3.5 w-36" />
          <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonDetailRows key={i} announce={false} rows={2} />
            ))}
          </div>
        </div>
      </LoadingRegion>
    </PageShell>
  );
}

/** A finalized Cycle: title and headline figure, the recipient cards, then the records. */
export function CycleAllocationSkeleton() {
  return (
    <PageShell variant="data" backdrop="signature">
      <LoadingRegion>
        <div aria-hidden className="mb-10 border-b border-rule-faint pb-10">
          <Skeleton shine={false} className="mb-6 h-3.5 w-40" />
          <Skeleton className="h-12 w-56 sm:h-16" />
          <Skeleton className="mt-4 h-10 w-64" />
          <div className="mt-5 space-y-2.5">
            <Skeleton className="h-3.5 w-72" />
            <Skeleton className="h-3.5 w-56" />
          </div>
        </div>
        <Skeleton className="mb-6 h-7 w-52" />
        <div aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(panel, 'p-5')}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-control" />
                <Skeleton className="h-4 w-32" />
              </div>
              <SkeletonDetailRows announce={false} rows={3} className="mt-3" />
            </div>
          ))}
        </div>
        <div className={cn(panel, 'mt-12 p-2 sm:p-3')}>
          <SkeletonTable announce={false} rows={8} columns={4} />
        </div>
      </LoadingRegion>
    </PageShell>
  );
}
