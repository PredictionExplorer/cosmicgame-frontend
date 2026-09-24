import { LedgerPageSkeleton } from '@/components/ui/page-skeletons';

/**
 * A cycle's direct ETH contributions while they render on the server: the
 * full-width header with its three figures, then a short ledger in the
 * page's reading column. The skeleton keeps the page's shape and edge, so
 * nothing moves when it arrives.
 */
export default function CycleContributionsLoading() {
  return <LedgerPageSkeleton figures={3} rows={4} columns={4} width="max-w-none" body="narrow" />;
}
