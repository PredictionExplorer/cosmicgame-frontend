import { useQuery } from '@tanstack/react-query';

import {
  fetchInkFilms,
  InkFilmsError,
  normalizeInkSeed,
  type InkFilms,
} from '@/lib/nftMetadata/ink';

/**
 * Mount only for the focused artwork. The small availability manifest is cached;
 * video requests belong to the player after the visitor chooses an ink film.
 */
export function useInkFilms(seed: string | number | null | undefined) {
  const normalized = normalizeInkSeed(seed);
  return useQuery<InkFilms | null>({
    queryKey: ['inkFilms', normalized ?? null],
    queryFn: ({ signal }) => fetchInkFilms(normalized!, { signal }),
    enabled: normalized !== undefined,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    // New variants can arrive while this artwork remains open. Keep the light
    // manifest fresh while visible, including confirmed missing packages.
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) =>
      failureCount < 1 && error instanceof InkFilmsError && error.retryable,
  });
}
