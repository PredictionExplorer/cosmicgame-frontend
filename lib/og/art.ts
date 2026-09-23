// lexicon-allow-start: backend HTTP URL paths and wire fields mirror the Go server and are a sealed contract
import { getAPIUrl } from '@/services/api/client';
import { getAssetsUrl } from '@/utils/urls';

import { loadScaledArtwork, pngDataUri } from './fetchImage';

/**
 * Artwork for the art-led share cards: which Signature a card shows, and its
 * pixels. Every reader resolves to `null` / `[]` on any failure so a card
 * falls back to its text layout instead of failing to render.
 */

/** How long share-card data reads may be served from the Data Cache, in seconds. */
export const OG_DATA_REVALIDATE_SECONDS = 3600;

/**
 * Width every render is scaled to: the plate of the plate card
 * (lib/og/CosmicOgCard.tsx), the largest size a card draws art at.
 */
export const OG_ARTWORK_WIDTH = 680;

export interface OgArtwork {
  tokenId: number;
  /** The owner-given name, when the token has one. */
  name: string | null;
  /** Cycle the Signature was imprinted in, when the API reports it. */
  cycle: number | null;
  /** `data:image/png;base64,…` of the source render. */
  src: string;
}

interface TokenRecord {
  TokenId?: unknown;
  TokenName?: unknown;
  RoundNum?: unknown;
  Seed?: unknown;
}

async function readApi(path: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(getAPIUrl(path), {
      headers: { Accept: 'application/json' },
      next: { revalidate: OG_DATA_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const asNonNegativeInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;

const asSeed = (value: unknown): string | null => {
  const seed = typeof value === 'string' ? value.trim().toLowerCase().replace(/^0x/, '') : '';
  return /^[0-9a-f]{64}$/.test(seed) ? seed : null;
};

/** The source render of a seed, from the media origin. */
export function artworkUrl(seed: string): string {
  return getAssetsUrl(`cosmicsignature/0x${seed}.png`);
}

async function artworkFrom(record: TokenRecord | null | undefined): Promise<OgArtwork | null> {
  const tokenId = asNonNegativeInteger(record?.TokenId);
  const seed = asSeed(record?.Seed);
  if (tokenId === null || seed === null) return null;
  const bytes = await loadScaledArtwork(artworkUrl(seed), OG_ARTWORK_WIDTH);
  if (!bytes) return null;
  const name = typeof record?.TokenName === 'string' ? record.TokenName.trim() : '';
  return {
    tokenId,
    name: name || null,
    cycle: asNonNegativeInteger(record?.RoundNum),
    src: pngDataUri(bytes),
  };
}

async function readToken(tokenId: number): Promise<TokenRecord | null> {
  const data = await readApi(`cst/info/${tokenId}`);
  const record = data?.TokenInfo;
  return record && typeof record === 'object' ? (record as TokenRecord) : null;
}

/** One token's artwork. */
export async function loadTokenArtwork(tokenId: number): Promise<OgArtwork | null> {
  return artworkFrom(await readToken(tokenId));
}

/** The newest imprints, newest first. */
export async function loadLatestArtworks(count: number): Promise<OgArtwork[]> {
  const dashboard = await readApi('statistics/dashboard');
  const stats = dashboard?.MainStats as { NumCSTokenMints?: unknown } | undefined;
  const imprinted = asNonNegativeInteger(stats?.NumCSTokenMints) ?? 0;
  const ids = Array.from(
    { length: Math.min(count, imprinted) },
    (_, index) => imprinted - 1 - index,
  );
  const artworks = await Promise.all(ids.map((id) => loadTokenArtwork(id)));
  return artworks.filter((artwork): artwork is OgArtwork => artwork !== null);
}

/** The cycle's Signature: the NFT imprinted for its Signature Allocation. */
export async function loadCycleArtwork(cycle: number): Promise<OgArtwork | null> {
  const data = await readApi(`rounds/info/${cycle}`);
  const info = data?.RoundInfo as
    | { MainPrize?: { NftTokenId?: unknown; Seed?: unknown } }
    | undefined;
  const tokenId = asNonNegativeInteger(info?.MainPrize?.NftTokenId);
  if (tokenId === null) return null;
  // The cycle record carries the seed but not the name; the token record has both.
  const token = await readToken(tokenId);
  return artworkFrom(
    token ?? { TokenId: tokenId, Seed: info?.MainPrize?.Seed, RoundNum: cycle, TokenName: null },
  );
}

/** Up to `count` Signatures a participant holds. */
export async function loadParticipantArtworks(
  address: string,
  count: number,
): Promise<OgArtwork[]> {
  const data = await readApi(`cst/list/by_user/${address}/0/${count}`);
  const tokens = Array.isArray(data?.UserTokens) ? (data.UserTokens as TokenRecord[]) : [];
  const artworks = await Promise.all(tokens.slice(0, count).map((token) => artworkFrom(token)));
  return artworks.filter((artwork): artwork is OgArtwork => artwork !== null);
}

export interface OgGestureRecord {
  position: number;
  cycle: number | null;
  /** 0 = ETH, 1 = ETH + RandomWalk NFT, 2 = CST (utils/gestures.ts). */
  method: number | null;
}

/** The gesture behind an event-log id (the `/gesture/[id]` route parameter). */
export async function loadGesture(eventId: number): Promise<OgGestureRecord | null> {
  const data = await readApi(`bid/info/${eventId}`);
  const info = data?.BidInfo as
    | { BidPosition?: unknown; RoundNum?: unknown; BidType?: unknown }
    | undefined;
  const position = asNonNegativeInteger(info?.BidPosition);
  if (position === null) return null;
  return {
    position,
    cycle: asNonNegativeInteger(info?.RoundNum),
    method: asNonNegativeInteger(info?.BidType),
  };
}
// lexicon-allow-end
