import { CycleAllocationSkeleton } from '@/components/ui/page-skeletons';

/**
 * A finalized Cycle's allocations while they render on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function CycleAllocationLoading() {
  return <CycleAllocationSkeleton />;
}
