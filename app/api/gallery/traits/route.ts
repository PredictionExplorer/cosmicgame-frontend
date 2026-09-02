/**
 * GET /api/gallery/traits
 *
 * Collection-wide trait index for the gallery: one compact row per Cosmic
 * Signature token (structure, palette, spectral class, chaos, fate, allocation,
 * palette hues, ...). The indexer's list API carries none of this, so the
 * server reads each token's metadata document once (Data Cache, 24h — traits
 * are immutable per seed) and ships a single JSON the browser can facet, sort,
 * and score for rarity without N requests.
 *
 * The handler is dynamic so the CDN headers can shorten when the walk was cut
 * short; the expensive part (per-token reads) is cached independently.
 */
import { NextResponse } from 'next/server';

import { buildCollectionTraitIndex } from '@/lib/nftMetadata/collectionIndex';
import { getAPIUrl } from '@/services/api/client';

export const dynamic = 'force-dynamic';

/** Safety cap so a corrupt count can never trigger an unbounded walk. */
const MAX_INDEXED_TOKENS = 20_000;
const COUNT_REVALIDATE_SECONDS = 60;

const FULL_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=3600';
const PARTIAL_CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=300';

/** Number of imprinted tokens (ids are sequential from 0), or null when unavailable. */
async function loadImprintedCount(): Promise<number | null> {
  try {
    const response = await fetch(getAPIUrl('statistics/dashboard'), {
      headers: { Accept: 'application/json' },
      next: { revalidate: COUNT_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { MainStats?: { NumCSTokenMints?: unknown } };
    const count = data.MainStats?.NumCSTokenMints;
    return typeof count === 'number' && Number.isFinite(count) && count >= 0 ? count : null;
  } catch {
    return null;
  }
}

export async function GET(): Promise<Response> {
  const total = await loadImprintedCount();
  if (total === null) {
    return NextResponse.json(
      { error: 'Collection size unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const index = await buildCollectionTraitIndex({ total: Math.min(total, MAX_INDEXED_TOKENS) });
  return NextResponse.json(index, {
    headers: { 'Cache-Control': index.partial ? PARTIAL_CACHE_CONTROL : FULL_CACHE_CONTROL },
  });
}
