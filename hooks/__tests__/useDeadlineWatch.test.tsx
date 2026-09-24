import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

import { useBackgroundDeadlineRefresh, useReturnResync } from '../useDeadlineWatch';

jest.unmock('@tanstack/react-query');

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
}

function wrapperFor(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  setVisibility('visible');
});

afterEach(() => {
  jest.useRealTimers();
  setVisibility('visible');
});

describe('useBackgroundDeadlineRefresh', () => {
  function useDeadlineQueries(armed: boolean, fetchDeadline: () => Promise<number>) {
    useQuery({ queryKey: ['allocationTime'], queryFn: fetchDeadline });
    useBackgroundDeadlineRefresh(armed, 30_000);
  }

  it('re-reads the deadline every 30 seconds while armed and hidden', async () => {
    const client = createClient();
    const fetchDeadline = jest.fn().mockResolvedValue(1_000);
    renderHook(() => useDeadlineQueries(true, fetchDeadline), { wrapper: wrapperFor(client) });
    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchDeadline).toHaveBeenCalledTimes(1);

    act(() => setVisibility('hidden'));
    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    expect(fetchDeadline).toHaveBeenCalledTimes(2);

    // Visible again: the page's own polling takes over.
    act(() => setVisibility('visible'));
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(fetchDeadline).toHaveBeenCalledTimes(2);
  });

  it('does nothing in the background unless the viewer armed an alert', async () => {
    const client = createClient();
    const fetchDeadline = jest.fn().mockResolvedValue(1_000);
    renderHook(() => useDeadlineQueries(false, fetchDeadline), { wrapper: wrapperFor(client) });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => setVisibility('hidden'));
    await act(async () => {
      jest.advanceTimersByTime(90_000);
    });
    expect(fetchDeadline).toHaveBeenCalledTimes(1);
  });
});

describe('useReturnResync', () => {
  it('holds from a stale return until a fresh deadline arrives', () => {
    const client = createClient();
    client.setQueryData(['allocationTime'], 100);
    const { result } = renderHook(() => useReturnResync({ maxAgeMs: 30_000 }), {
      wrapper: wrapperFor(client),
    });
    expect(result.current).toBe(false);

    act(() => setVisibility('hidden'));
    act(() => {
      jest.advanceTimersByTime(5 * 60_000);
    });
    act(() => setVisibility('visible'));
    expect(result.current).toBe(true);

    act(() => {
      client.setQueryData(['allocationTime'], 200);
    });
    expect(result.current).toBe(false);
  });

  it('does not hold when the deadline is still fresh on return', () => {
    const client = createClient();
    client.setQueryData(['allocationTime'], 100);
    const { result } = renderHook(() => useReturnResync({ maxAgeMs: 30_000 }), {
      wrapper: wrapperFor(client),
    });

    act(() => setVisibility('hidden'));
    act(() => {
      jest.advanceTimersByTime(10_000);
    });
    act(() => setVisibility('visible'));
    expect(result.current).toBe(false);
  });

  it('gives up waiting after the timeout', () => {
    const client = createClient();
    client.setQueryData(['allocationTime'], 100);
    const { result } = renderHook(() => useReturnResync({ maxAgeMs: 30_000, timeoutMs: 8_000 }), {
      wrapper: wrapperFor(client),
    });

    act(() => setVisibility('hidden'));
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    act(() => setVisibility('visible'));
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(8_000);
    });
    expect(result.current).toBe(false);
  });
});
