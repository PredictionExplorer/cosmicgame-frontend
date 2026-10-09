'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import type { CSTTokenInfo } from '@/services/api';
import { LATEST_SIGNATURES_LIMIT } from '@/lib/latestSignatures';

const EMPTY: readonly CSTTokenInfo[] = [];

function withSeed(tokens: readonly CSTTokenInfo[]): CSTTokenInfo[] {
  return tokens.filter((token) => token.Seed !== undefined && String(token.Seed).trim() !== '');
}

export interface LatestSignaturesState {
  /** Newest first; empty until read, or when nothing has been imprinted. */
  signatures: readonly CSTTokenInfo[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * The newest imprinted Signatures, newest first. Keyed by the newest token
 * id the dashboard reports, so a finalization that imprints new Signatures
 * refetches the list on its own; the server seed paints the first frame when
 * it describes the same newest token.
 */
export function useLatestSignatures(
  imprintedCount: number | null | undefined,
  seed?: readonly CSTTokenInfo[] | null,
): LatestSignaturesState {
  const newestId =
    imprintedCount != null && Number.isSafeInteger(imprintedCount) && imprintedCount > 0
      ? imprintedCount - 1
      : null;
  const seedMatches =
    seed != null && seed.length > 0 && (newestId === null || seed[0]?.TokenId === newestId);

  const query = useQuery<CSTTokenInfo[]>({
    queryKey: ['latestSignatures', LATEST_SIGNATURES_LIMIT, newestId],
    queryFn: ({ signal }) =>
      api.get_cst_list({ offset: 0, limit: LATEST_SIGNATURES_LIMIT, signal }),
    enabled: newestId !== null,
    staleTime: 5 * 60_000,
    initialData: seedMatches ? [...seed] : undefined,
  });

  return {
    signatures: query.data ? withSeed(query.data) : EMPTY,
    isLoading: query.data === undefined && (newestId === null || query.isLoading),
    isError: query.data === undefined && query.isError,
  };
}
