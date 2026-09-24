import { LedgerPageSkeleton } from '@/components/ui/page-skeletons';

/**
 * An address's CST transfer history while it renders on the server: the
 * header with its three totals, then a page of the four-column ledger.
 * The skeleton keeps the page's shape and edge, so nothing moves when it arrives.
 */
export default function CstTransfersLoading() {
  return <LedgerPageSkeleton figures={3} columns={4} width="max-w-none" />;
}
