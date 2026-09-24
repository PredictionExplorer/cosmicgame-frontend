import { LedgerPageSkeleton } from '@/components/ui/page-skeletons';

/**
 * An address's NFT transfer history while it renders on the server: the
 * header with its three counts, then a page of the four-column ledger.
 * The skeleton keeps the page's shape and edge, so nothing moves when it arrives.
 */
export default function NftTransfersLoading() {
  return <LedgerPageSkeleton figures={3} columns={4} width="max-w-none" />;
}
