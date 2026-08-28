import { act, renderHook, waitFor } from '@testing-library/react';

import {
  harnessControlUrl,
  isHarnessUiEnabled,
  useHarnessControl,
} from '@/hooks/useHarnessControl';

const STATUS = {
  ready: true,
  scenario: 'ambient',
  phase: 'live',
  pace: 'demo',
  paused: false,
  transition: {
    kind: 'scenario' as const,
    state: 'running' as const,
    target: 'ambient',
    error: null,
  },
  cycle: {
    index: '4',
    active: true,
    opened: true,
    secondsUntilActivation: '-10',
    secondsUntilFinalization: '120',
    finalizationTime: '1780000000',
    lastGestureAddress: '0x1111111111111111111111111111111111111111',
    nextEthGestureCost: '1000',
    nextCstGestureCost: '0',
  },
  personas: [{ name: 'Nova', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' }],
  scenarios: ['ambient', 'quiet'],
  phases: ['live', 'final-ten'],
  paces: ['realtime', 'demo', 'fast'],
};

function mockFetchOk(): jest.Mock {
  const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/status')) {
      return { ok: true, json: async () => STATUS } as Response;
    }
    return { ok: true, json: async () => ({ ok: true }) } as Response;
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('isHarnessUiEnabled', () => {
  it('is disabled outside harness testing mode (hermetic test env)', () => {
    // jest.setup pins NEXT_PUBLIC_NETWORK=sepolia and no NEXT_PUBLIC_HARNESS.
    expect(isHarnessUiEnabled()).toBe(false);
  });

  it('falls back to the default control URL', () => {
    expect(harnessControlUrl()).toBe('http://127.0.0.1:8686');
  });
});

describe('useHarnessControl', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('polls the director status and exposes it', async () => {
    const fetchMock = mockFetchOk();
    const { result, unmount } = renderHook(() => useHarnessControl());
    await waitFor(() => expect(result.current.status?.scenario).toBe('ambient'));
    expect(result.current.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:8686/status',
      expect.objectContaining({ method: 'GET', headers: undefined }),
    );
    unmount();
  });

  it('sends commands and refreshes afterwards', async () => {
    const fetchMock = mockFetchOk();
    const { result, unmount } = renderHook(() => useHarnessControl());
    await waitFor(() => expect(result.current.status).not.toBeNull());

    await act(async () => {
      await result.current.switchScenario('quiet');
      await result.current.driveToPhase('final-ten');
      await result.current.setPace('fast');
      await result.current.makeGesture({ persona: 'Nova', kind: 'eth' });
      await result.current.finalizeCycle();
      await result.current.setPaused(true);
    });

    const posts = fetchMock.mock.calls
      .map(([url, init]) => [String(url), (init as RequestInit | undefined)?.method])
      .filter(([, method]) => method === 'POST')
      .map(([url]) => String(url).replace('http://127.0.0.1:8686', ''));
    expect(posts).toEqual(
      expect.arrayContaining(['/scenario', '/phase', '/pace', '/gesture', '/finalize', '/pause']),
    );
    unmount();
  });

  it('surfaces director errors without crashing', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ error: 'director offline' }),
    })) as unknown as typeof fetch;

    const { result, unmount } = renderHook(() => useHarnessControl());
    await waitFor(() => expect(result.current.error).toBe('director offline'));
    expect(result.current.status).toBeNull();
    unmount();
  });

  it('keeps a command error visible after a successful status refresh', async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/status')) {
        return { ok: true, json: async () => STATUS } as Response;
      }
      if (init?.method === 'POST') {
        return {
          ok: false,
          status: 400,
          json: async () => ({ error: 'phase unavailable' }),
        } as Response;
      }
      throw new Error(`Unexpected request: ${url}`);
    }) as unknown as typeof fetch;

    const { result, unmount } = renderHook(() => useHarnessControl());
    await waitFor(() => expect(result.current.status).not.toBeNull());

    await act(async () => {
      await expect(result.current.driveToPhase('final-ten')).rejects.toThrow('phase unavailable');
    });

    expect(result.current.commandError).toBe('phase unavailable');
    expect(result.current.error).toBe('phase unavailable');
    act(() => result.current.clearCommandError());
    expect(result.current.commandError).toBeNull();
    unmount();
  });
});
