import { LedgerPageSkeleton } from '@/components/ui/page-skeletons';

/**
 * A system event ledger while it renders on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function SystemEventLoading() {
  return <LedgerPageSkeleton columns={3} />;
}
