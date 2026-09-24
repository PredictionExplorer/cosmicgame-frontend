import { attachedNftRef } from '@/components/attachments/attachedNftMetadata';
import {
  fetchAttachedNftImage,
  findAttachedNftRecord,
  readAttachedNftMetadataDocument,
} from '@/components/attachments/attachedNftMetadata.server';

interface RouteParams {
  params: Promise<{ address: string; tokenId: string }>;
}

/**
 * NFT images are immutable in practice: the browser keeps one a day and the
 * CDN a week, and the image optimizer (the only regular caller) caches its
 * resized copies for as long.
 */
const IMAGE_CACHE = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800';
const MISS_CACHE = 'public, max-age=60, s-maxage=300';

function miss(status: 400 | 404 | 502) {
  return new Response(null, { status, headers: { 'Cache-Control': MISS_CACHE } });
}

/**
 * GET /api/attached-nft/<contract>/<tokenId>/image — the image of an NFT
 * attached to a gesture, streamed from the first public source that serves
 * it. `<NFTImage>` requests it through the Next image optimizer, so the
 * browser downloads a resized copy from our origin instead of the original
 * from a slow public IPFS gateway.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { address, tokenId: rawTokenId } = await params;
  const { tokenAddr, tokenId } = attachedNftRef({ tokenAddr: address, tokenId: rawTokenId });
  if (!tokenAddr || !tokenId) return miss(400);

  let record: Awaited<ReturnType<typeof findAttachedNftRecord>>;
  try {
    record = await findAttachedNftRecord(tokenAddr, tokenId);
  } catch {
    return miss(502);
  }
  const uri = typeof record?.NFTTokenURI === 'string' ? record.NFTTokenURI.trim() : '';
  if (!uri) return miss(404);

  const metadata = await readAttachedNftMetadataDocument(uri);
  const image = metadata?.image ? await fetchAttachedNftImage(metadata.image) : null;
  if (!image) return miss(502);

  const headers = new Headers({
    'Content-Type': image.contentType,
    'Cache-Control': IMAGE_CACHE,
    // Third-party bytes on our origin: never sniffed, never run.
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'X-Content-Type-Options': 'nosniff',
  });
  return new Response(image.body, { headers });
}
