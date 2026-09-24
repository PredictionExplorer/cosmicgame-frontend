/**
 * @jest-environment node
 */
import { IPFS_GATEWAYS } from '../attachedNftMetadata';
import {
  fetchAttachedNftImage,
  fetchPublicHttps,
  findAttachedNftRecord,
  imageUrlCandidates,
  isPublicHttpsUrl,
  resolveAttachedNftDisplay,
  withSameOriginImage,
} from '../attachedNftMetadata.server';

const mockRecords = jest.fn();
// lexicon-allow-start: test mocks mirror sealed API module filenames.
jest.mock('../../../services/api/donations', () => ({
  get_donations_nft_list: () => mockRecords(),
}));
// lexicon-allow-end
jest.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

const CONTRACT = '0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f';
const GATEWAY = IPFS_GATEWAYS[0];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function imageResponse(type: string, status = 200) {
  return new Response(new Uint8Array([1, 2, 3]), { status, headers: { 'Content-Type': type } });
}

describe('isPublicHttpsUrl', () => {
  it.each([
    'https://gateway.pinata.cloud/ipfs/bafy/1',
    'https://randomwalknft-api.com/metadata/4079',
  ])('accepts %s', (url) => {
    expect(isPublicHttpsUrl(url)).toBe(true);
  });

  it.each([
    'http://randomwalknft-api.com/metadata/4079',
    'https://localhost/x',
    'https://localhost./x',
    'https://metadata.google.internal./x',
    'https://127.0.0.1/x',
    'https://2130706433/x',
    'https://[::1]/x',
    'https://intranet/x',
    'https://metadata.internal/x',
    'https://printer.local/x',
    'https://user:pass@example.com/x',
    'https://example.com:8443/x',
    'javascript:alert(1)',
    'not a url',
  ])('refuses %s', (url) => {
    expect(isPublicHttpsUrl(url)).toBe(false);
  });
});

function redirectResponse(location: string, status = 302) {
  return new Response(null, { status, headers: { Location: location } });
}

describe('fetchPublicHttps', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('follows a redirect to another public https host, checking each hop', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(redirectResponse('https://bafy.ipfs.dweb.link/1.json'))
      .mockResolvedValueOnce(jsonResponse({ name: 'GBC' }));

    const response = await fetchPublicHttps('https://dweb.link/ipfs/bafy/1.json');
    await expect(response.json()).resolves.toEqual({ name: 'GBC' });
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://dweb.link/ipfs/bafy/1.json',
      expect.objectContaining({ redirect: 'manual' }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://bafy.ipfs.dweb.link/1.json',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });

  it('never follows a public host to a private one', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(redirectResponse('http://169.254.169.254/latest/meta-data'));
    await expect(fetchPublicHttps('https://art.example.com/1.json')).rejects.toThrow(
      'Refused a non-public URL',
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('gives up after a few redirects', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(redirectResponse('https://art.example.com/loop')));
    await expect(fetchPublicHttps('https://art.example.com/loop')).rejects.toThrow(
      'Too many redirects',
    );
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });

  it('refuses a private url before any request', async () => {
    global.fetch = jest.fn();
    await expect(fetchPublicHttps('https://127.0.0.1/x')).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('imageUrlCandidates', () => {
  it('tries the same file on every gateway, the given one first', () => {
    expect(imageUrlCandidates(`${IPFS_GATEWAYS[1]}bafy/4035.png`)).toEqual([
      `${IPFS_GATEWAYS[1]}bafy/4035.png`,
      ...IPFS_GATEWAYS.filter((gateway) => gateway !== IPFS_GATEWAYS[1]).map(
        (gateway) => `${gateway}bafy/4035.png`,
      ),
    ]);
  });

  it('keeps a public https file as is and refuses anything else', () => {
    expect(imageUrlCandidates('https://nfts.example.com/4079.png')).toEqual([
      'https://nfts.example.com/4079.png',
    ]);
    expect(imageUrlCandidates('http://10.0.0.1/4079.png')).toEqual([]);
  });
});

describe('withSameOriginImage', () => {
  it('moves a public image to the image route and keeps the upstream file as the fallback', () => {
    expect(
      withSameOriginImage({ name: 'GBC', image: `${GATEWAY}bafy/1.png` }, CONTRACT, '1'),
    ).toEqual({
      name: 'GBC',
      image: `/api/attached-nft/${CONTRACT.toLowerCase()}/1/image`,
      imageFallback: `${GATEWAY}bafy/1.png`,
    });
  });

  it('leaves an image the server may not fetch to the browser', () => {
    const metadata = { name: 'Local', image: 'http://example.com/1.png' };
    expect(withSameOriginImage(metadata, CONTRACT, '1')).toBe(metadata);
  });
});

describe('findAttachedNftRecord', () => {
  beforeEach(() => {
    mockRecords.mockResolvedValue([
      { TokenAddr: CONTRACT, NFTTokenId: 4035, NFTTokenURI: 'ipfs://bafy/4035' },
      { TokenAddr: CONTRACT, NFTTokenId: '8489', NFTTokenURI: 'ipfs://bafy/8489' },
    ]);
  });

  it('matches the contract case-insensitively and the id as a number', async () => {
    await expect(findAttachedNftRecord(CONTRACT.toLowerCase(), '8489')).resolves.toMatchObject({
      NFTTokenURI: 'ipfs://bafy/8489',
    });
  });

  it('resolves null for a token the indexer does not list', async () => {
    await expect(findAttachedNftRecord(CONTRACT, '1')).resolves.toBeNull();
  });
});

describe('resolveAttachedNftDisplay', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reads the document through the data cache and serves its image from our origin', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation((url: string) =>
        url.startsWith(GATEWAY)
          ? Promise.resolve(jsonResponse({ name: 'GBC #4035', image: 'ipfs://bafy/4035.png' }))
          : Promise.reject(new Error('gateway down')),
      );

    await expect(
      resolveAttachedNftDisplay({
        TokenAddr: CONTRACT,
        NFTTokenId: 4035,
        NFTTokenURI: 'ipfs://bafy-doc/4035',
      }),
    ).resolves.toMatchObject({
      name: 'GBC #4035',
      image: `/api/attached-nft/${CONTRACT.toLowerCase()}/4035/image`,
      imageFallback: `${GATEWAY}bafy/4035.png`,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${GATEWAY}bafy-doc/4035`,
      expect.objectContaining({ next: { revalidate: 86_400 } }),
    );
  });

  it('never fetches a token uri on a private host', async () => {
    global.fetch = jest.fn();
    await expect(
      resolveAttachedNftDisplay({
        TokenAddr: CONTRACT,
        NFTTokenId: 1,
        NFTTokenURI: 'https://169.254.169.254/latest/meta-data',
      }),
    ).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('fetchAttachedNftImage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('streams the first raster image a gateway serves', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation((url: string) =>
        Promise.resolve(
          url.startsWith(IPFS_GATEWAYS[1])
            ? imageResponse('image/png')
            : imageResponse('text/plain', 429),
        ),
      );

    const image = await fetchAttachedNftImage(`${GATEWAY}bafy/1.png`);
    expect(image?.contentType).toBe('image/png');
    expect(global.fetch).toHaveBeenCalledTimes(IPFS_GATEWAYS.length);
    // Kept in the data cache: the optimizer's next width reuses the bytes.
    expect(global.fetch).toHaveBeenCalledWith(
      `${IPFS_GATEWAYS[1]}bafy/1.png`,
      expect.objectContaining({ next: { revalidate: 604_800 } }),
    );
  });

  it('refuses SVG, which could run script on our origin', async () => {
    global.fetch = jest.fn().mockResolvedValue(imageResponse('image/svg+xml'));
    await expect(fetchAttachedNftImage('https://art.example.com/1.svg')).resolves.toBeNull();
  });
});
