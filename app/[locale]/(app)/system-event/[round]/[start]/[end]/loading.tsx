import { LedgerPageSkeleton } from '@/components/ui/page-skeletons';

/**
 * A configuration window while it renders on the server: the full-width
 * header with its count and dates, then the changes in the page's reading
 * column. The skeleton keeps the page's shape, so nothing moves when it
 * arrives.
 */
export default function SystemEventLoading() {
  return <LedgerPageSkeleton figures={3} rows={5} columns={3} width="max-w-none" body="narrow" />;
}
