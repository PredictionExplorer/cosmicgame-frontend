import { unstable_cache } from 'next/cache';

import { CACHE_WINDOW, capCacheWindow } from '@/lib/cacheWindow';

jest.mock('next/cache', () => ({ unstable_cache: jest.fn() }));

const mockUnstableCache = unstable_cache as jest.MockedFunction<typeof unstable_cache>;

describe('capCacheWindow', () => {
  beforeEach(() => {
    mockUnstableCache.mockReset();
    mockUnstableCache.mockImplementation((read) => read);
  });

  it.each(Object.entries(CACHE_WINDOW))(
    'makes one cached read with the %s window, so Next.js keeps the render no longer',
    async (window, seconds) => {
      await capCacheWindow(window as keyof typeof CACHE_WINDOW);
      expect(mockUnstableCache).toHaveBeenCalledTimes(1);
      expect(mockUnstableCache).toHaveBeenCalledWith(
        expect.any(Function),
        ['cache-window', String(seconds)],
        { revalidate: seconds },
      );
    },
  );

  it('keys each window apart, so one window never answers for another', async () => {
    await capCacheWindow('live');
    await capCacheWindow('pending');
    const keys = mockUnstableCache.mock.calls.map(([, keyParts]) => keyParts);
    expect(new Set(keys.map((key) => JSON.stringify(key))).size).toBe(2);
  });

  it('does nothing outside a Next.js render, where there is no cache to lower', async () => {
    mockUnstableCache.mockImplementation(() => async () => {
      throw new Error('Invariant: incrementalCache missing in unstable_cache');
    });
    await expect(capCacheWindow('pending')).resolves.toBeUndefined();
  });

  it('orders the windows from the longest to the shortest', () => {
    expect(CACHE_WINDOW.final).toBeGreaterThan(CACHE_WINDOW.live);
    expect(CACHE_WINDOW.live).toBeGreaterThan(CACHE_WINDOW.pending);
  });
});
