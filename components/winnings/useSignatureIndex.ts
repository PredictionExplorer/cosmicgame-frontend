import { useCallback, useMemo } from 'react';

import { useCSTList } from '@/hooks/useApiQuery';

/** What a card needs to draw one Signature. */
export interface SignatureIndexEntry {
  seed: string | number | undefined;
  name: string | undefined;
}

/**
 * Seeds and names of every imprinted Signature, by token id, from the
 * collection list the gallery already caches. One query serves every plate
 * on an allocation page, instead of one token request per plate. While the
 * list loads (or when a token is newer than the index) `get` returns
 * `undefined` and the plate shows its pending state.
 */
export function useSignatureIndex(): {
  get: (tokenId: number) => SignatureIndexEntry | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useCSTList();
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
  return { get, isLoading };
}
