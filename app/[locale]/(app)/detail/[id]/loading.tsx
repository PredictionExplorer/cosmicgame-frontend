import { NftDetailSkeleton } from '@/components/ui/page-skeletons';

/**
 * A Cosmic Signature NFT page while it renders on the server.
 * The skeleton keeps the page's shape, so nothing moves when it arrives.
 */
export default function NftDetailLoading() {
  return <NftDetailSkeleton />;
}
