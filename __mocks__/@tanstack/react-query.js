module.exports = {
  useQuery: () => ({ data: undefined, isLoading: false, error: null }),
  QueryClient: class QueryClient {},
  QueryClientProvider: ({ children }) => children,
};
