/**
 * Jest mock for `@tanstack/react-query`. Returns empty default state so
 * components that call `useQuery` render without hitting the network.
 */
import type { ReactNode } from 'react';

module.exports = {
  useQuery: () => ({ data: undefined, isLoading: false, error: null }),
  QueryClient: class QueryClient {},
  QueryClientProvider: ({ children }: { children: ReactNode }) => children,
};
