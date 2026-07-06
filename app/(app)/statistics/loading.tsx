import { Skeleton, SkeletonStatCard, SkeletonTableRow } from '@/components/ui/skeleton';

/** Route-transition fallback for statistics pages: mirrors the typical page shape. */
export default function StatisticsLoading() {
  return (
    <div data-testid="statistics-page-loading">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-4 h-10 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-4 w-full max-w-3xl" />
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </div>
    </div>
  );
}
