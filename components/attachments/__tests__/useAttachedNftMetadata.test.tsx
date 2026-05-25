import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
}));

import {
  fetchAttachedNftMetadata,
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
    expect(normalizeIpfsUrl('https://example.com/image.png')).toBeNull();
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
});

describe('useAttachedNftMetadata', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockUseQuery.mockClear();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, error: null });
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

  it('configures the query as disabled when uri is absent', () => {
    useAttachedNftMetadata('');
    expect(getOptions()).toMatchObject({
      queryKey: ['attachedNftMetadata', ''],
      enabled: false,
      retry: false,
    });
  });

  it('configures and executes a metadata query for a valid uri', async () => {
    useAttachedNftMetadata('https://metadata.example/1');

    const options = getOptions();
    expect(options.queryKey).toEqual(['attachedNftMetadata', 'https://metadata.example/1']);
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
});
