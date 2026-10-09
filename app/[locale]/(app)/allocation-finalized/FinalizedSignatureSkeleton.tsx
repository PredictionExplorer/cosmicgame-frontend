import { PendingPlate } from '@/components/ui/art-frame';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A finalized cycle's record while it loads: the plate (7 of 12 columns from
 * `lg`) beside the spec sheet's rows, the shape the record lands in, so
 * nothing moves when it arrives. Shared by the page and its loading state
 * (`FinalizedLoading`).
 */
export function FinalizedSignatureSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-start"
    >
      <div className="flex flex-col gap-4 lg:col-span-7">
        <PendingPlate busy />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-3.5 w-40" />
      </div>
      <div className="lg:col-span-5">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 divide-y divide-rule-faint border-y border-rule-faint">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex min-h-[var(--row-h)] items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
