import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

import { fetchInkFilms, InkFilmsError, type InkFilms } from '@/lib/nftMetadata/ink';

import { useInkFilms } from '../useInkFilms';

jest.unmock('@tanstack/react-query');
jest.mock('@/lib/nftMetadata/ink', () => ({
  ...jest.requireActual('@/lib/nftMetadata/ink'),
  fetchInkFilms: jest.fn(),
}));

const mockFetch = jest.mocked(fetchInkFilms);
const films: InkFilms = {
  films: [{ variant: 'medium', url: '/videos/web/ember_medium.mp4', durationSeconds: 113.35 }],
  poster: undefined,
};

let client: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retryDelay: 1 } } });
  mockFetch.mockReset().mockResolvedValue(films);
});

afterEach(() => {
  cleanup();
  client.clear();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('useInkFilms', () => {
  it.each([null, undefined, '', '0x', '../other', 'not-a-seed', -1, NaN])(
    'does not request a manifest for an unavailable or invalid seed (%s)',
    (seed) => {
      const { result } = renderHook(() => useInkFilms(seed), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockFetch).not.toHaveBeenCalled();
    },
  );

  it('normalizes the cache key and shares one manifest read between consumers', async () => {
    const first = renderHook(() => useInkFilms('0xAbC'), { wrapper });
    const second = renderHook(() => useInkFilms(' abc '), { wrapper });
    await waitFor(() => expect(first.result.current.data).toEqual(films));
    expect(second.result.current.data).toEqual(films);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('abc', { signal: expect.any(AbortSignal) });
    expect(client.getQueryData(['inkFilms', 'abc'])).toEqual(films);
  });

  it('caches a confirmed absence and revalidates it once stale', async () => {
    mockFetch.mockResolvedValueOnce(null).mockResolvedValueOnce(films);
    const now = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
    const first = renderHook(() => useInkFilms('abc'), { wrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    expect(first.result.current.data).toBeNull();
    first.unmount();
    const fresh = renderHook(() => useInkFilms('abc'), { wrapper });
    expect(fresh.result.current.data).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    fresh.unmount();
    clock.mockReturnValue(now + 5 * 60_000 + 1);
    const stale = renderHook(() => useInkFilms('abc'), { wrapper });
    await waitFor(() => expect(stale.result.current.data).toEqual(films));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('periodically discovers newly rendered variants while the artwork stays open', async () => {
    jest.useFakeTimers();
    mockFetch.mockResolvedValueOnce(null).mockResolvedValueOnce(films);
    const { result } = renderHook(() => useInkFilms('abc'), { wrapper });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(result.current.data).toBeNull();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(5 * 60_000 + 1);
    });
    expect(result.current.data).toEqual(films);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('cancels the previous seed and never shows its late result for a new artwork', async () => {
    let resolveOld!: (value: InkFilms) => void;
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    const { result, rerender } = renderHook(({ seed }) => useInkFilms(seed), {
      wrapper,
      initialProps: { seed: 'abc' },
    });
    const previousSignal = mockFetch.mock.calls[0]?.[1]?.signal;
    rerender({ seed: 'def' });
    expect(previousSignal?.aborted).toBe(true);
    expect(result.current.data).toBeUndefined();
    await waitFor(() => expect(result.current.data).toEqual(films));
    await act(async () => resolveOld({ films: [], poster: 'old-artwork.webp' }));
    expect(result.current.data).toEqual(films);
    expect(client.getQueryData(['inkFilms', 'abc'])).toBeUndefined();
  });

  it('cancels an in-flight manifest when its last consumer unmounts', () => {
    mockFetch.mockImplementation(() => new Promise(() => undefined));
    const { unmount } = renderHook(() => useInkFilms('abc'), { wrapper });
    const signal = mockFetch.mock.calls[0]?.[1]?.signal;
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('retries a transient failure once and exposes the recovered result', async () => {
    mockFetch
      .mockRejectedValueOnce(new InkFilmsError('Unavailable', true))
      .mockResolvedValueOnce(films);
    const { result } = renderHook(() => useInkFilms('abc'), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(films));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('stops after one transient retry and exposes failure without pretending absence', async () => {
    mockFetch.mockRejectedValue(new InkFilmsError('Unavailable', true));
    const { result } = renderHook(() => useInkFilms('abc'), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it.each([new InkFilmsError('Malformed manifest'), new DOMException('Canceled', 'AbortError')])(
    'does not retry malformed data or cancellation',
    async (error) => {
      mockFetch.mockRejectedValue(error);
      const { result } = renderHook(() => useInkFilms('abc'), { wrapper });
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBe(error);
    },
  );
});
