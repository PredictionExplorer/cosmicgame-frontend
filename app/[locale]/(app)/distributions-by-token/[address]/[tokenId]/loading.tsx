import { LedgerPageSkeleton } from '@/components/ui/page-skeletons';

/**
 * An anchored token's distributions while they render on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function DistributionsByTokenLoading() {
  return <LedgerPageSkeleton width="max-w-5xl" summaryRows={2} columns={6} />;
}
