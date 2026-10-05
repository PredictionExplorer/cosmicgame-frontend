'use client';

import type { CosmicSignatureMetadata } from '@/lib/nftMetadata';
import type { CSTTokenInfo } from '@/services/api/types';
import NFTTrait from '@/components/nft/NFTTrait';
import { PageShell } from '@/components/ui/page-shell';

interface DetailPageProps {
  /** A token id the route layout has already checked (a whole number the API holds). */
  tokenId: number;
  /** Server-rendered metadata document (`null` when the origin has none). */
  initialMetadata?: CosmicSignatureMetadata | null;
  /** The token record the server read (Tx fields flattened); omit to load it on the client. */
  initialToken?: CSTTokenInfo | null;
}

const DetailPage = ({ tokenId, initialMetadata, initialToken }: DetailPageProps) => (
  // Lights down: no atmosphere behind the art, so the plate's black is the
  // only ground the Signature sits on.
  <PageShell variant="detail" backdrop="none" className="max-w-none px-0">
    <NFTTrait tokenId={tokenId} initialMetadata={initialMetadata} initialToken={initialToken} />
  </PageShell>
);

export default DetailPage;
