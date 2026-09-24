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
 * page's own shape: the header with its figure strip, the plate beside its
 * wall label, then the deposit ledger. Nothing moves when the page arrives.
 */
export default function DistributionsByTokenLoading() {
  const t = useTranslations('common');
  return (
    <PageShell variant="data">
      <div role="status" aria-busy="true">
        <span className="sr-only">{t('status.loadingEllipsis')}</span>
        <div aria-hidden className="mb-10">
          <SkeletonPageHeader className="mb-8" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div
          aria-hidden
          className="mb-10 flex flex-col gap-5 border-b border-rule-faint pb-8 sm:flex-row sm:items-center sm:gap-6"
        >
          <SkeletonArtPlate className="w-full shrink-0 sm:w-48" />
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
        <SkeletonTable announce={false} rows={4} columns={5} />
      </div>
    </PageShell>
  );
}
