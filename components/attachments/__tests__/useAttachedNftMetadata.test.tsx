import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
}));

const mockReadContract = jest.fn();
const mockUsePublicClient = jest.fn();
jest.mock('wagmi', () => ({
  usePublicClient: (...args: unknown[]) => mockUsePublicClient(...args),
}));

import {
  IPFS_GATEWAYS,
  fetchAttachedNftMetadata,
  metadataUrlCandidates,
  normalizeAttachedNftMetadata,
  normalizeIpfsUrl,
  normalizeMetadataAssetUrl,
  useAttachedNftMetadata,
} from '../useAttachedNftMetadata';

const mockUseQuery = useQuery as jest.Mock;

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('useAttachedNftMetadata helpers', () => {
  it('normalizes ipfs urls', () => {
    expect(normalizeIpfsUrl('ipfs://bafy/image.png')).toBe('https://ipfs.io/ipfs/bafy/image.png');
    expect(normalizeIpfsUrl('ipfs://ipfs/bafy/image.png')).toBe(
      'https://ipfs.io/ipfs/bafy/image.png',
    );
    expect(normalizeIpfsUrl('ipfs://bafy/image.png', IPFS_GATEWAYS[1])).toBe(
      `${IPFS_GATEWAYS[1]}bafy/image.png`,
    );
    expect(normalizeIpfsUrl('https://example.com/image.png')).toBeNull();
  });

  it('builds one candidate per gateway for ipfs metadata uris', () => {
    expect(metadataUrlCandidates('ipfs://bafy/1')).toEqual(
      IPFS_GATEWAYS.map((gateway) => `${gateway}bafy/1`),
    );
    expect(metadataUrlCandidates('https://metadata.example/1')).toEqual([
      'https://metadata.example/1',
    ]);
    expect(metadataUrlCandidates('ar://abc')).toEqual([]);
  });

  it('normalizes image urls safely', () => {
    expect(normalizeMetadataAssetUrl('https://cdn.example/image.png')).toBe(
      'https://cdn.example/image.png',
    );
    expect(normalizeMetadataAssetUrl('ipfs://bafy/image.png')).toBe(
      'https://ipfs.io/ipfs/bafy/image.png',
    );
    expect(normalizeMetadataAssetUrl('/image.png', 'https://metadata.example/token/1')).toBe(
      'https://metadata.example/image.png',
    );
    expect(normalizeMetadataAssetUrl('ar://unsupported')).toBeUndefined();
    expect(normalizeMetadataAssetUrl('javascript:alert(1)')).toBeUndefined();
    expect(normalizeMetadataAssetUrl('')).toBeUndefined();
  });

  it('serves ipfs images from the gateway that served the metadata', () => {
    expect(
      normalizeMetadataAssetUrl('ipfs://bafy/image.png', `${IPFS_GATEWAYS[1]}bafy/meta/1`),
    ).toBe(`${IPFS_GATEWAYS[1]}bafy/image.png`);
  });

  it('preserves rich metadata fields and removes unsafe links', () => {
    expect(
      normalizeAttachedNftMetadata(
        {
          name: 'Token One',
          description: 'A nice NFT',
          image: 'ipfs://bafy/image.png',
          external_url: 'javascript:alert(1)',
          collection_name: 'Collection',
          artist: 'Artist',
          platform: 'Platform',
        },
        'https://metadata.example/token/1',
      ),
    ).toMatchObject({
      name: 'Token One',
      description: 'A nice NFT',
      image: 'https://ipfs.io/ipfs/bafy/image.png',
      external_url: undefined,
      collection_name: 'Collection',
      artist: 'Artist',
      platform: 'Platform',
    });
  });

  it('exposes an alternate-gateway fallback for ipfs images', () => {
    const metadata = normalizeAttachedNftMetadata(
      { image: 'ipfs://bafy/image.png' },
      `${IPFS_GATEWAYS[1]}bafy/meta/1`,
    );
    expect(metadata?.image).toBe(`${IPFS_GATEWAYS[1]}bafy/image.png`);
    expect(metadata?.imageFallback).toBe(`${IPFS_GATEWAYS[0]}bafy/image.png`);
  });

  it('returns null for invalid metadata payloads', () => {
    expect(normalizeAttachedNftMetadata(null)).toBeNull();
    expect(normalizeAttachedNftMetadata([])).toBeNull();
    expect(normalizeAttachedNftMetadata('not-json')).toBeNull();
  });
});

describe('fetchAttachedNftMetadata', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches and normalizes metadata', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse({ image: 'ipfs://bafy/image.png', external_url: 'https://x.io' }),
    );

    await expect(fetchAttachedNftMetadata('https://metadata.example/1')).resolves.toMatchObject({
      image: 'https://ipfs.io/ipfs/bafy/image.png',
      external_url: 'https://x.io/',
    });
  });

  it('returns null for unusable metadata uri without fetching', async () => {
    await expect(fetchAttachedNftMetadata('ar://abc')).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('throws on non-ok responses so the hook can expose error state', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockJsonResponse({}, 404));
    await expect(fetchAttachedNftMetadata('https://metadata.example/404')).rejects.toThrow(
      'Failed to fetch NFT metadata',
    );
  });

  it('races all gateways for ipfs uris and uses the one that answers', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.startsWith(IPFS_GATEWAYS[1])) {
        return Promise.resolve(mockJsonResponse({ name: 'Rexy', image: 'ipfs://bafy/img.png' }));
      }
      return Promise.reject(new Error('gateway down'));
    });

    const metadata = await fetchAttachedNftMetadata('ipfs://bafy/3114');
    expect(metadata).toMatchObject({
      name: 'Rexy',
      image: `${IPFS_GATEWAYS[1]}bafy/img.png`,
    });
    expect(global.fetch).toHaveBeenCalledTimes(IPFS_GATEWAYS.length);
  });

  it('rejects when every gateway fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('gateway down'));
    await expect(fetchAttachedNftMetadata('ipfs://bafy/1')).rejects.toThrow('gateway down');
  });
});

describe('useAttachedNftMetadata', () => {
  const originalFetch = global.fetch;
  const tokenAddr = '0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f';

  beforeEach(() => {
    mockUseQuery.mockClear();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, error: null });
    mockReadContract.mockReset();
    mockUsePublicClient.mockReset();
    mockUsePublicClient.mockReturnValue({ readContract: mockReadContract });
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        mockJsonResponse({ name: 'Cached NFT', image: 'https://cdn.example/nft.png' }),
      );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function getOptions() {
    return mockUseQuery.mock.calls[0]![0] as {
      queryKey: unknown[];
      queryFn: () => Promise<unknown>;
      enabled: boolean;
      staleTime: number;
      gcTime: number;
      retry: boolean;
    };
  }

  it('configures the query as disabled when uri and token ref are absent', () => {
    useAttachedNftMetadata('');
    expect(getOptions()).toMatchObject({
      queryKey: ['attachedNftMetadata', '', null, null],
      enabled: false,
      retry: false,
    });
  });

  it('stays enabled without a uri when a token reference allows an on-chain read', () => {
    useAttachedNftMetadata('', { tokenAddr, tokenId: 4035 });
    expect(getOptions()).toMatchObject({
      queryKey: ['attachedNftMetadata', '', tokenAddr, '4035'],
      enabled: true,
    });
  });

  it('configures and executes a metadata query for a valid uri', async () => {
    useAttachedNftMetadata('https://metadata.example/1');

    const options = getOptions();
    expect(options.queryKey).toEqual([
      'attachedNftMetadata',
      'https://metadata.example/1',
      null,
      null,
    ]);
    expect(options.enabled).toBe(true);
    await expect(options.queryFn()).resolves.toMatchObject({
      name: 'Cached NFT',
      image: 'https://cdn.example/nft.png',
    });
  });

  it('keeps fetch failures inside the query function', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse({}, 500));
    useAttachedNftMetadata('https://metadata.example/500');

    await expect(getOptions().queryFn()).rejects.toThrow('Failed to fetch NFT metadata');
  });

  it('falls back to the on-chain tokenURI when the indexed uri fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockJsonResponse({}, 404))
      .mockResolvedValueOnce(mockJsonResponse({ name: 'Onchain NFT' }));
    mockReadContract.mockResolvedValue('https://onchain.example/4035');

    useAttachedNftMetadata('https://metadata.example/broken', { tokenAddr, tokenId: '4035' });

    await expect(getOptions().queryFn()).resolves.toMatchObject({ name: 'Onchain NFT' });
    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: tokenAddr,
        functionName: 'tokenURI',
        args: [4035n],
      }),
    );
  });

  it('rethrows the original failure when the chain returns the same uri', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockJsonResponse({}, 404));
    mockReadContract.mockResolvedValue('https://metadata.example/broken');

    useAttachedNftMetadata('https://metadata.example/broken', { tokenAddr, tokenId: 1 });

    await expect(getOptions().queryFn()).rejects.toThrow('Failed to fetch NFT metadata');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
