import { TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';

import { GET } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      json: async () => body,
    }),
  },
}));

type ResponseShape = {
  status: number;
  headers: Record<string, string>;
  json: () => Promise<unknown>;
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('GET /api/gallery/traits', () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('aggregates every token document into a compact index with CDN cache headers', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('statistics/dashboard')) {
        return jsonResponse({ MainStats: { NumCSTokenMints: 2 } });
      }
      if (url.endsWith('/metadata/0')) return jsonResponse(TOKEN_7_METADATA_V2);
      if (url.endsWith('/metadata/1')) return jsonResponse(TOKEN_1_METADATA_V2);
      return jsonResponse({}, 404);
    });

    const response = (await GET()) as unknown as ResponseShape;
    const body = (await response.json()) as {
      total: number;
      indexed: number;
      partial: boolean;
      entries: Array<{ id: number; structure?: string }>;
    };

    expect(response.status).toBe(200);
    expect(response.headers['Cache-Control']).toContain('s-maxage=300');
    expect(body.total).toBe(2);
    expect(body.indexed).toBe(2);
    expect(body.partial).toBe(false);
    expect(body.entries.map((entry) => entry.id)).toEqual([1, 7]);
    // Per-token reads are pinned in the Data Cache for a day (traits are immutable per seed).
    const metadataCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/metadata/1'));
    expect(metadataCall?.[1]).toMatchObject({ next: { revalidate: 86_400 } });
  });

  it('shortens the cache window when the walk was cut short', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('statistics/dashboard')) {
        return jsonResponse({ MainStats: { NumCSTokenMints: 2 } });
      }
      if (url.endsWith('/metadata/0')) return jsonResponse(TOKEN_7_METADATA_V2);
      return jsonResponse({ error: 'upstream' }, 500);
    });

    const response = (await GET()) as unknown as ResponseShape;
    const body = (await response.json()) as { partial: boolean; indexed: number };

    expect(body.partial).toBe(true);
    expect(body.indexed).toBe(1);
    expect(response.headers['Cache-Control']).toContain('s-maxage=30');
  });

  it('answers 503 without caching when the collection size is unknown', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'down' }, 502));

    const response = (await GET()) as unknown as ResponseShape;

    expect(response.status).toBe(503);
    expect(response.headers['Cache-Control']).toBe('no-store');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('treats a network failure on the count read as unavailable', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    const response = (await GET()) as unknown as ResponseShape;

    expect(response.status).toBe(503);
  });
});
