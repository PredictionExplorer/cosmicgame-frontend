import { NFTDetailSkeleton } from '@/components/nft/NFTDetailSkeleton';
import { PageShell } from '@/components/ui/page-shell';

/**
 * A Cosmic Signature NFT page while it renders on the server: the same
 * skeleton, shell and (absent) backdrop as the page's own loading state, so a
 * click from a wall never flashes a different layout before the page lands.
 */
export default function NftDetailLoading() {
  return (
    <PageShell variant="detail" backdrop="none" className="max-w-none px-0">
      <NFTDetailSkeleton />
    </PageShell>
  );
}
