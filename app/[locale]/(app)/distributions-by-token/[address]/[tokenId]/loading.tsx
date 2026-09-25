import { useTranslations } from 'next-intl';

import { PageShell } from '@/components/ui/page-shell';
import {
  Skeleton,
  SkeletonArtPlate,
  SkeletonPageHeader,
  SkeletonTable,
} from '@/components/ui/skeleton';

/**
 * An anchored token's distributions while they render on the server, in the
 * page's own shape: the header, the plate and its wall label beside the
 * figure strip and the anchor's spec rows, then the deposit ledger. Nothing
 * moves when the page arrives.
 */
export default function DistributionsByTokenLoading() {
  const t = useTranslations('common');
  return (
    <PageShell variant="data">
      <div role="status" aria-busy="true">
        <span className="sr-only">{t('status.loadingEllipsis')}</span>
        <div aria-hidden>
          <SkeletonPageHeader className="mb-8" />
        </div>
        <div
          aria-hidden
          className="mb-10 grid gap-x-10 gap-y-8 border-b border-rule-faint pb-10 sm:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]"
        >
          <div className="space-y-3">
            <SkeletonArtPlate />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </div>
            <div className="divide-y divide-rule-faint border-y border-rule-faint">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex min-h-11 items-center justify-between gap-6">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <SkeletonTable announce={false} rows={4} columns={5} />
      </div>
    </PageShell>
  );
}
