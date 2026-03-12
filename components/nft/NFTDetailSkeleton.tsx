import { Skeleton } from '@/components/ui/skeleton';

export function NFTDetailSkeleton() {
  return (
    <div className="container mx-auto px-4" data-testid="nft-detail-skeleton">
      {/* Breadcrumb */}
      <div className="pt-4 pb-6">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Hero: Image + Identity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-6 w-2/3" />
          </div>
        ))}
      </div>

      {/* Seed block */}
      <div className="mt-6">
        <Skeleton className="h-12 w-full max-w-md rounded-lg" />
      </div>

      {/* Video preview */}
      <div className="mt-12">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="aspect-video w-full max-w-2xl rounded-xl" />
      </div>
    </div>
  );
}
