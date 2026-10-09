import { NextResponse } from 'next/server';

import { attachedNftRef } from '@/components/attachments/attachedNftMetadata';
import {
  findAttachedNftRecord,
  resolveAttachedNftDisplay,
} from '@/components/attachments/attachedNftMetadata.server';

interface RouteParams {
  params: Promise<{ address: string; tokenId: string }>;
}

/** A resolved document changes rarely: browsers keep it an hour, the CDN a day. */
const FOUND_CACHE = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
/** A miss may be an indexer or gateway hiccup: retried after five minutes. */
const MISS_CACHE = 'public, max-age=60, s-maxage=300';

function miss(status: 400 | 404 | 502) {
  return NextResponse.json(null, { status, headers: { 'Cache-Control': MISS_CACHE } });
}

/**
 * GET /api/attached-nft/<contract>/<tokenId> — the display metadata (name,
 * collection, links, and the image on our origin) of an NFT attached to a
 * gesture. Only tokens the indexer lists are resolved.
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
  if (!record) return miss(404);

  const metadata = await resolveAttachedNftDisplay(record);
  if (!metadata) return miss(502);
  return NextResponse.json(metadata, { headers: { 'Cache-Control': FOUND_CACHE } });
}
