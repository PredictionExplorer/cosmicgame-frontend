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

/**
 * Seeds and names of every imprinted Signature, by token id, from the
 * collection list the gallery already caches. One query serves every plate
 * on an allocation page. Measured on production: the whole list is 3.7 KB
 * gzipped for 48 tokens, while a single `cst/info/{id}` is 2.5 KB because it
 * embeds its cycle's full allocation ledger, so per-token reads cost more
 * until the collection is some ten times larger; a batched seed endpoint is
 * the lasting fix. A token newer than the index is simply absent: its plate
 * shows the designed unavailable state.
 */
export function useSignatureIndex(): {
  get: (tokenId: number) => SignatureIndexEntry | undefined;
  state: SignatureArtState;
  retry: () => void;
} {
  const { data, isLoading, isError, refetch } = useCSTList();
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
  const retry = useCallback(() => void refetch(), [refetch]);
  // A failed refetch keeps the list it had: the plates stay drawn from it.
  const state: SignatureArtState = data
    ? 'ready'
    : isError
      ? 'failed'
      : isLoading
        ? 'loading'
        : 'ready';
  return { get, state, retry };
}
