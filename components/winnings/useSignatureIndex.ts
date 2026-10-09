import { useCallback, useMemo } from 'react';

import { useCSTList } from '@/hooks/useApiQuery';

/** What a card needs to draw one Signature. */
export interface SignatureIndexEntry {
  seed: string | number | undefined;
  name: string | undefined;
}

/**
 * Where the index stands, and so every plate that reads from it: `loading`
 * (plates hold a busy pending state, never "Artwork unavailable"), `failed`
 * (the page shows one notice with a retry) or `ready`.
 */
export type SignatureArtState = 'loading' | 'failed' | 'ready';

export interface SignatureIndex {
  /** A token's seed and name, when the index has it. */
  get: (tokenId: number) => SignatureIndexEntry | undefined;
  /**
   * A token's seed for a plate that can look one token up itself
   * (`TokenPlate`): the seed, `null` when the indexer has none yet, and
   * `undefined` when the index does not hold the token (its read failed, or
   * the token is newer), so the plate falls back to its own lookup.
   */
  seedFor: (tokenId: number) => string | number | null | undefined;
  state: SignatureArtState;
  retry: () => void;
}

/**
 * Seeds and names of every imprinted Signature, by token id, from the
 * collection list the gallery already caches: the one index every page that
 * draws several Signatures reads, so a cycle's recipients, a ledger of
 * imprints or a transfer history costs one request instead of one token
 * lookup per plate. Measured on production: the whole list is 3.7 KB gzipped
 * for 48 tokens, while a single `cst/info/{id}` read is some 36 KB before
 * compression because it embeds its cycle's full record, so per-token reads
 * cost more until the collection is many times larger; a batched seed
 * endpoint is the lasting fix. Pass `enabled: false` when every plate already
 * has its seed (a cycle's record carries its Signature's, a server read the
 * others'): nothing is read, and the state is `ready`.
 */
export function useSignatureIndex({ enabled = true }: { enabled?: boolean } = {}): SignatureIndex {
  const { data, isLoading, isError, refetch } = useCSTList({ enabled });
  const index = useMemo(() => {
    const byId = new Map<number, SignatureIndexEntry>();
    for (const token of data ?? []) {
      if (typeof token.TokenId !== 'number') continue;
      const name = typeof token.TokenName === 'string' ? token.TokenName.trim() : '';
      byId.set(token.TokenId, { seed: token.Seed, name: name || undefined });
    }
    return byId;
  }, [data]);
  const get = useCallback((tokenId: number) => index.get(tokenId), [index]);
  const seedFor = useCallback(
    (tokenId: number) => {
      const entry = index.get(tokenId);
      return entry ? (entry.seed ?? null) : undefined;
    },
    [index],
  );
  const retry = useCallback(() => void refetch(), [refetch]);
  // A failed refetch keeps the list it had: the plates stay drawn from it.
  const state: SignatureArtState = data
    ? 'ready'
    : isError
      ? 'failed'
      : isLoading
        ? 'loading'
        : 'ready';
  return { get, seedFor, state, retry };
}
