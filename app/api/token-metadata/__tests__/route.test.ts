import { GET } from '../route';

const ADDRESS = '0x1111111111111111111111111111111111111111';
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

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

describe('/api/token-metadata', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('rejects missing address', async () => {
    const response = await GET(request('http://localhost/api/token-metadata'));

    await expect(response.json()).resolves.toEqual({ error: 'Missing address' });
    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects invalid address', async () => {
    const response = await GET(request('http://localhost/api/token-metadata?address=0xBad'));

    await expect(response.json()).resolves.toEqual({ error: 'Invalid address' });
    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns token logo metadata with cache headers', async () => {
    const response = await GET(
      request(`http://localhost/api/token-metadata?address=${WETH}&chainId=42161`),
    );
    const json = await response.json();

    expect(json).toMatchObject({
      logoURI: expect.stringContaining('trustwallet'),
      source: 'Trust Wallet',
    });
    expect(response.status).toBe(200);
    expect(response.headers).toMatchObject({
      'Cache-Control': expect.stringContaining('s-maxage=3600'),
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns null for unknown tokens', async () => {
    const response = await GET(
      request(`http://localhost/api/token-metadata?address=${ADDRESS}&chainId=421614`),
    );

    await expect(response.json()).resolves.toBeNull();
    expect(response.status).toBe(200);
  });
});
