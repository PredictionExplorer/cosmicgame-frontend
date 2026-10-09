/**
 * The NFT detail page seeds its token record from an ISR render that can be
 * days old. The seed must paint at once and still be refreshed on mount, even
 * with the app's `refetchOnWindowFocus: false`; the home hero's seed (the
 * artwork only) must not cost a second read.
 */
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import api, { type CSTTokenInfo } from '@/services/api';

import { useCSTInfo } from '../useApiQuery';

jest.unmock('@tanstack/react-query');

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get_cst_info: jest.fn() },
}));

const getCstInfo = jest.mocked(api.get_cst_info);

const seed = {
  TokenId: 25,
  CurOwnerAddr: '0x1111111111111111111111111111111111111111',
  Staked: false,
} as CSTTokenInfo;
const live = {
  ...seed,
  CurOwnerAddr: '0x2222222222222222222222222222222222222222',
  Staked: true,
} as CSTTokenInfo;

function wrapper() {
  // The app's own defaults (app/[locale]/(app)/providers.tsx): no refetch on focus.
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  getCstInfo.mockReset();
  getCstInfo.mockResolvedValue(live);
});

describe('useCSTInfo seed freshness', () => {
  it('paints a stale seed at once, then fetches the live record on mount', async () => {
    const { result } = renderHook(() => useCSTInfo(25, seed, { seedIsStale: true }), {
      wrapper: wrapper(),
    });

    expect(result.current.data).toBe(seed);
    expect(result.current.isLoading).toBe(false);
    await waitFor(() => expect(getCstInfo).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.data).toEqual(live));
  });

  it('keeps a fresh seed without a second read', async () => {
    const { result } = renderHook(() => useCSTInfo(25, seed), { wrapper: wrapper() });

    expect(result.current.data).toBe(seed);
    // Let any mount effect run before asserting nothing was fetched.
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    expect(getCstInfo).not.toHaveBeenCalled();
  });
});
