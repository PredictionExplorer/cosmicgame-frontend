'use client';

import { useCallback, useMemo } from 'react';

import { useCSTList } from '@/hooks/useApiQuery';

export interface SignatureSeeds {
  /** The collection is still being read: show pending plates, not a lookup per token. */
  pending: boolean;
  /**
   * A token's seed from the collection read. `undefined` when the read has
   * not got it (it failed, or the token is newer than the read), so the plate
   * falls back to looking the one token up itself.
   */
  seedFor: (tokenId: number) => string | number | null | undefined;
}

/**
 * The seeds of the Cosmic Signature collection from one read, shared with
 * the gallery's query, so a ledger of artworks costs one request instead of
 * one token lookup per row. Pass `enabled: false` for an empty ledger.
 */
export function useSignatureSeeds(enabled: boolean = true): SignatureSeeds {
  const collection = useCSTList({ enabled });
  const seeds = useMemo(
    () => new Map((collection.data ?? []).map((token) => [token.TokenId, token.Seed ?? null])),
    [collection.data],
  );
  const seedFor = useCallback((tokenId: number) => seeds.get(tokenId), [seeds]);
  return { pending: enabled && collection.isLoading, seedFor };
}
