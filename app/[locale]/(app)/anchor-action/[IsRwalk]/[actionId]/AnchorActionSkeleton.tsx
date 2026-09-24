import { useTranslations } from 'next-intl';

import { Skeleton, SkeletonArtPlate } from '@/components/ui/skeleton';

/**
 * An anchor action's record while it loads: the plate and its wall label at
 * the start (7 of 12 columns from `lg`), the spec rows and the timeline
 * beside it. The route's `loading.tsx` and the page's own loading state draw
 * this same shape, so a navigation fills in without moving.
 */
export function AnchorActionSkeleton() {
  const t = useTranslations('common');
  return (
    <div
      role="status"
      aria-label={t('status.loading')}
      className="grid gap-x-12 gap-y-10 lg:grid-cols-12"
    >
      <div className="lg:col-span-7" aria-hidden>
        <SkeletonArtPlate />
        <Skeleton className="mt-4 h-5 w-48" />
        <Skeleton className="mt-2 h-3.5 w-28" />
      </div>
      <div className="space-y-4 lg:col-span-5" aria-hidden>
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
        <Skeleton className="mt-8 h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
