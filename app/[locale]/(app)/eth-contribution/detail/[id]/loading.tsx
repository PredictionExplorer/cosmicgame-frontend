import { RecordDetailSkeleton } from '@/components/ui/page-skeletons';

/**
 * An ETH contribution record while it renders on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function EthContributionLoading() {
  return <RecordDetailSkeleton sections={[4, 2]} />;
}
