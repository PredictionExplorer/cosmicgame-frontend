/**
 * React Query hooks for Cosmic Signature trait data: the collection-wide
 * index served by `/api/gallery/traits` (facets, rarity, per-card traits) and
 * the full metadata document of a single token (quick view, detail panel).
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  buildFacets,
  chaosBounds,
  fetchNftMetadata,
  scoreRarity,
  type CollectionTraitIndex,
  type CosmicSignatureMetadata,
  type FacetIndex,
  type NftTraitEntry,
  type NumericBounds,
  type RarityIndex,
} from '@/lib/nftMetadata';

/** Query key of the collection trait index. */
export const COLLECTION_TRAIT_INDEX_QUERY_KEY = ['collectionTraitIndex'] as const;

/** Same-origin endpoint that aggregates every token's traits. */
export const COLLECTION_TRAIT_INDEX_PATH = '/api/gallery/traits';

/** Loads the aggregated trait index from this app's route handler. */
export async function fetchCollectionTraitIndex(
  signal?: AbortSignal,
): Promise<CollectionTraitIndex> {
  const response = await fetch(COLLECTION_TRAIT_INDEX_PATH, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to load the trait index (${response.status})`);
  }
  return (await response.json()) as CollectionTraitIndex;
}

/** Raw collection index query. Prefer {@link useCollectionTraits} for derived data. */
export function useCollectionTraitIndex() {
  return useQuery<CollectionTraitIndex>({
    queryKey: COLLECTION_TRAIT_INDEX_QUERY_KEY,
    queryFn: ({ signal }) => fetchCollectionTraitIndex(signal),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    // A partial index means the server's walk was cut short; keep asking
    // until the missing tokens land.
    refetchInterval: (query) => (query.state.data?.partial ? 30_000 : false),
  });
}

/** Everything the gallery derives from the collection index, memoized once per payload. */
export interface CollectionTraits {
  entries: NftTraitEntry[];
  byId: Map<number, NftTraitEntry>;
  facets: FacetIndex;
  rarity: RarityIndex;
  chaos: NumericBounds | null;
  /** Tokens the indexer reports as imprinted. */
  total: number;
  /** Tokens present in the index. */
  indexed: number;
  partial: boolean;
}

/** Builds the memoized view of a collection index (exported for tests and stories). */
export function deriveCollectionTraits(index: CollectionTraitIndex): CollectionTraits {
  const byId = new Map<number, NftTraitEntry>();
  for (const entry of index.entries) byId.set(entry.id, entry);
  return {
    entries: index.entries,
    byId,
    facets: buildFacets(index.entries),
    rarity: scoreRarity(index.entries),
    chaos: chaosBounds(index.entries),
    total: index.total,
    indexed: index.indexed,
    partial: index.partial,
  };
}

/** Collection trait index plus facets and rarity, ready for cards and filters. */
export function useCollectionTraits() {
  const query = useCollectionTraitIndex();
  const traits = useMemo(
    () => (query.data ? deriveCollectionTraits(query.data) : null),
    [query.data],
  );
  return {
    traits,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/** Options for {@link useNftMetadata}. */
export interface UseNftMetadataOptions {
  enabled?: boolean;
  /** Server-rendered document to hydrate with (`null` = confirmed missing). */
  initialData?: CosmicSignatureMetadata | null;
}

/** Full metadata document of one token, read straight from the media origin. */
export function useNftMetadata(
  tokenId: number | null | undefined,
  options: UseNftMetadataOptions = {},
) {
  const validId = tokenId != null && Number.isInteger(tokenId) && tokenId >= 0;
  return useQuery<CosmicSignatureMetadata | null>({
    queryKey: ['nftMetadata', validId ? tokenId : null],
    queryFn: ({ signal }) => fetchNftMetadata(tokenId as number, { signal }),
    enabled: validId && (options.enabled ?? true),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    ...(options.initialData !== undefined
      ? { initialData: options.initialData, initialDataUpdatedAt: () => Date.now() }
      : {}),
  });
}
