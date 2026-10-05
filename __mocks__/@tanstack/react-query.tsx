/**
 * Jest mock for `@tanstack/react-query`. Returns empty default state so
 * components that call `useQuery` render without hitting the network.
 */
import type { ReactNode } from 'react';

const emptyQueryCache = {
  subscribe: () => () => undefined,
  findAll: () => [],
  getAll: () => [],
};

module.exports = {
  useQuery: () => ({ data: undefined, isLoading: false, error: null }),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
    getQueryCache: () => emptyQueryCache,
  }),
  onlineManager: {
    isOnline: () => true,
    subscribe: () => () => undefined,
  },
  QueryClient: class QueryClient {},
  QueryCache: class QueryCache {},
  QueryClientProvider: ({ children }: { children: ReactNode }) => children,
};
