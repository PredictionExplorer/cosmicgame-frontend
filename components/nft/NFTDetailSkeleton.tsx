import { PendingPlate } from '@/components/ui/art-frame';
import { Skeleton } from '@/components/ui/skeleton';

/** Rows of the provenance ledger the skeleton reserves. */
const SPEC_ROWS = 6;

/**
 * The detail page while the token record loads, matched to its layout: the
 * pending plate at the art's ratio with the label row under it, and the wall
 * label beside it (breadcrumb, name, caption line, ledger rows).
 */
export function NFTDetailSkeleton() {
  return (
    <div className="site-container" data-testid="nft-detail-skeleton" aria-busy="true">
      <div className="grid items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:gap-x-16">
        <div className="flex flex-col gap-3 max-sm:-mx-[var(--gutter)]">
          <PendingPlate busy className="max-sm:rounded-none" />
          <div className="flex items-center gap-2 max-sm:px-[var(--gutter)]">
            <Skeleton className="h-11 w-44 rounded-control sm:h-9" />
            <Skeleton className="ml-auto h-11 w-40 rounded-control sm:h-9" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="divide-y divide-rule-faint border-y border-rule-faint">
            {Array.from({ length: SPEC_ROWS }, (_, row) => (
              <div
                key={row}
                className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-x-4 py-3.5"
                data-testid="spec-row-skeleton"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-24 rounded-control sm:h-9" />
            <Skeleton className="h-11 w-36 rounded-control sm:h-9" />
          </div>
        </div>
      </div>
    </div>
  );
}
