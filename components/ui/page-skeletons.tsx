import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { PageShell } from '@/components/ui/page-shell';
import { Skeleton, SkeletonDetailRows, SkeletonPageHeader } from '@/components/ui/skeleton';

/**
 * Route-level loading skeletons for the record pages still rendered on every
 * request (`loading.tsx`). The others are cached renders (on-demand ISR),
 * which cannot have a translated loading boundary (record-route-caching.test).
 *
 * A route rendered per request answers a click on a record only once the
 * server has, so its boundary keeps the finished page's shell, column and
 * blocks: the page fills in without moving, and announces "Loading" once.
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
  align = 'center',
}: {
  /** Rows per section card, top to bottom. */
  sections?: readonly number[];
  /** The page's own column width. */
  width?: 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl';
  shell?: 'data' | 'detail';
  /** `start` for a record set on the site's content edge rather than centred in it. */
  align?: 'center' | 'start';
}) {
  return (
    <PageShell variant={shell} backdrop="signature" className="max-sm:pb-16">
      <LoadingRegion className={cn(align === 'center' && 'mx-auto', width)}>
        <SkeletonPageHeader />
        {sections.map((rows, i) => (
          <SkeletonSectionCard key={i} rows={rows} />
        ))}
      </LoadingRegion>
    </PageShell>
  );
}
