import { GET } from '../route';

const CONTRACT = '0x1234567890abcdef1234567890abcdef12345678';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: HeadersInit }) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      json: async () => body,
    }),
  },
}));

function request(url: string) {
  return { nextUrl: new URL(url) } as Parameters<typeof GET>[0];
}

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('/api/nft-estimate', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('rejects missing contract', async () => {
    const response = await GET(request('http://localhost/api/nft-estimate'));
    await expect(response.json()).resolves.toEqual({ error: 'Missing contract' });
    expect(response.status).toBe(400);
  });

  it('rejects invalid contract format', async () => {
    const response = await GET(request('http://localhost/api/nft-estimate?contract=0xBad'));
    await expect(response.json()).resolves.toEqual({ error: 'Invalid contract' });
    expect(response.status).toBe(400);
  });

  it('returns unavailable without provider call for unsupported chains', async () => {
    const response = await GET(
      request(`http://localhost/api/nft-estimate?contract=${CONTRACT}&chainId=421614`),
    );

    await expect(response.json()).resolves.toBeNull();
    expect(response.status).toBe(200);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('maps Reservoir collection floor response to normalized estimate', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse({
        collections: [
          {
            floorAsk: {
              price: {
                amount: { native: 0.42 },
                currency: { symbol: 'ETH' },
              },
              source: {
                name: 'OpenSea',
                domain: 'opensea.io',
              },
            },
          },
        ],
      }),
    );

    const response = await GET(
      request(`http://localhost/api/nft-estimate?contract=${CONTRACT}&chainId=42161`),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      floorPriceEth: 0.42,
      currency: 'ETH',
      source: 'OpenSea',
      sourceUrl: 'https://opensea.io',
      confidence: 'collection-floor',
    });
    expect(json.updatedAt).toEqual(expect.any(String));
  });

  it('returns unavailable when provider has no valid floor', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse({ collections: [{ floorAsk: {} }] }),
    );

    const response = await GET(
      request(`http://localhost/api/nft-estimate?contract=${CONTRACT}&chainId=42161`),
    );

    await expect(response.json()).resolves.toBeNull();
    expect(response.status).toBe(200);
  });

  it('returns unavailable for provider failures without leaking details', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockJsonResponse('forbidden', 403));

    const response = await GET(
      request(`http://localhost/api/nft-estimate?contract=${CONTRACT}&chainId=42161`),
    );

    await expect(response.json()).resolves.toBeNull();
    expect(response.status).toBe(200);
  });

  it('returns unavailable for provider timeouts or thrown errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('secret provider failure'));

    const response = await GET(
      request(`http://localhost/api/nft-estimate?contract=${CONTRACT}&chainId=42161`),
    );

    await expect(response.json()).resolves.toBeNull();
    expect(response.status).toBe(200);
  });
});
