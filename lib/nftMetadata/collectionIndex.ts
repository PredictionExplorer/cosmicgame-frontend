/**
 * Collection-wide trait index: one compact {@link NftTraitEntry} per token,
 * built server-side so the browser downloads a single document instead of
 * one metadata JSON per token.
 *
 * Token ids are sequential from 0, so the builder walks `0 .. total - 1` with
 * a small worker pool. Each per-token read is an ordinary `fetch`, which lets
 * the caller pin it in the Next.js Data Cache (traits are immutable per seed),
 * so rebuilding the index is mostly cache reads plus the handful of tokens
 * imprinted since the last build. A time budget and a consecutive-failure
 * cutoff keep a slow or unhealthy media origin from stalling the response:
 * whatever was gathered is returned with `partial: true` and clients refetch.
 */
import { fetchNftMetadata } from './fetch';
import { normalizeTraitEntry, type NftTraitEntry } from './traits';
import type { CosmicSignatureMetadata } from './types';

/** Bumped whenever the entry shape changes so stale CDN copies are recognizable. */
export const COLLECTION_TRAIT_INDEX_VERSION = 1;

/** The document served by `GET /api/gallery/traits`. */
export interface CollectionTraitIndex {
  version: number;
  /** Tokens the indexer reports as imprinted (ids `0 .. total - 1`). */
  total: number;
  /** Tokens whose metadata was read successfully. */
  indexed: number;
  /** Tokens the media origin reported as not found (metadata not published yet). */
  missing: number;
  /**
   * True when some tokens could not be read this time: a failed read, the
   * failure cutoff, or the time budget. Clients should refetch; a `missing`
   * token alone does not make the index partial.
   */
  partial: boolean;
  generatedAt: string;
  entries: NftTraitEntry[];
}

/** Knobs for {@link buildCollectionTraitIndex}; the loader is injectable for tests. */
export interface BuildCollectionTraitIndexOptions {
  total: number;
  concurrency?: number;
  timeBudgetMs?: number;
  /** Consecutive failed reads after which the walk stops (media origin unhealthy). */
  maxConsecutiveFailures?: number;
  load?: (tokenId: number) => Promise<CosmicSignatureMetadata | null>;
  now?: () => number;
}

/** Traits never change for a seed, so per-token reads can live a full day in the Data Cache. */
export const TOKEN_METADATA_REVALIDATE_SECONDS = 86_400;

const DEFAULT_CONCURRENCY = 8;
const DEFAULT_TIME_BUDGET_MS = 20_000;
const DEFAULT_MAX_CONSECUTIVE_FAILURES = 12;

function defaultLoad(tokenId: number): Promise<CosmicSignatureMetadata | null> {
  return fetchNftMetadata(tokenId, {
    next: { revalidate: TOKEN_METADATA_REVALIDATE_SECONDS },
  });
}

/** Walks every token id and assembles the collection index. Never throws. */
export async function buildCollectionTraitIndex(
  options: BuildCollectionTraitIndexOptions,
): Promise<CollectionTraitIndex> {
  const total = Math.max(0, Math.trunc(options.total));
  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);
  const timeBudgetMs = options.timeBudgetMs ?? DEFAULT_TIME_BUDGET_MS;
  const maxConsecutiveFailures = options.maxConsecutiveFailures ?? DEFAULT_MAX_CONSECUTIVE_FAILURES;
  const load = options.load ?? defaultLoad;
  const now = options.now ?? Date.now;

  const startedAt = now();
  const entries: NftTraitEntry[] = [];
  let nextId = 0;
  let partial = false;
  let stopped = false;
  let missing = 0;
  let consecutiveFailures = 0;

  async function worker(): Promise<void> {
    while (!stopped) {
      if (now() - startedAt > timeBudgetMs) {
        partial = true;
        stopped = true;
        return;
      }
      const tokenId = nextId++;
      if (tokenId >= total) return;
      try {
        const metadata = await load(tokenId);
        consecutiveFailures = 0;
        if (!metadata) {
          missing += 1;
          continue;
        }
        const entry = normalizeTraitEntry(metadata, tokenId);
        if (entry) entries.push(entry);
        else missing += 1;
      } catch {
        partial = true;
        consecutiveFailures += 1;
        if (consecutiveFailures >= maxConsecutiveFailures) {
          stopped = true;
          return;
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(total, 1)) }, worker));

  entries.sort((a, b) => a.id - b.id);

  return {
    version: COLLECTION_TRAIT_INDEX_VERSION,
    total,
    indexed: entries.length,
    missing,
    partial,
    generatedAt: new Date(now()).toISOString(),
    entries,
  };
}
