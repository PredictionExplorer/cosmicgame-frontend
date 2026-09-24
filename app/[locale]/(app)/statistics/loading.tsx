import { Skeleton, SkeletonPageHeader, SkeletonTable } from '@/components/ui/skeleton';

/**
 * Route-transition fallback for the statistics pages, in the finished page's
 * shape: the header, the section tabs on its rule, and a section of rows.
 */
export default function StatisticsLoading() {
  return (
    <div data-testid="statistics-page-loading" aria-busy>
      <SkeletonPageHeader breadcrumb={false} className="mb-8" />
      <div aria-hidden className="mb-10 flex gap-6 border-b border-rule pb-3 sm:mb-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} shine={false} className="h-3.5 w-16 shrink-0" />
        ))}
      </div>
      <Skeleton className="mb-8 h-7 w-56" />
      <SkeletonTable rows={6} columns={3} />
    </div>
  );
}
