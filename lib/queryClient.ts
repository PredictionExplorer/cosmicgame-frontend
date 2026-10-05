import { QueryCache, QueryClient } from '@tanstack/react-query';

import { reportError } from '@/utils/errors';

/**
 * The React Query client of every app-host shell: the dApp's providers and
 * the chrome-free embed shell read the API with the same caching, retries
 * and error reporting.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    // Surface failed reads in Sentry. `apiCall` already reports transport
    // errors; this additionally catches queryFn-level failures (schema
    // asserts, envelope errors) with the owning query key for context.
    queryCache: new QueryCache({
      onError: (error, query) => {
        reportError(error, `query:${String(query.queryKey[0] ?? 'unknown')}`);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 300_000,
        refetchOnWindowFocus: false,
        // Two retries (~3 attempts) balances resilience against slow error
        // surfacing now that per-section error states are user-visible.
        retry: 2,
      },
    },
  });
}
