import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
}));

import { useNFTCollectionEstimate } from '../useNFTCollectionEstimate';

const CONTRACT = '0x1234567890abcdef1234567890abcdef12345678';
const mockUseQuery = useQuery as jest.Mock;

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('useNFTCollectionEstimate', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockUseQuery.mockClear();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, error: null });
    global.fetch = jest.fn();
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

  it('configures the query as disabled without a valid contract', () => {
    useNFTCollectionEstimate({ tokenAddr: '0xBad' });

    expect(getOptions()).toMatchObject({
      enabled: false,
      retry: false,
    });
  });

  it('fetches a normalized collection estimate through the query function', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse({
        floorPriceEth: 0.42,
        currency: 'ETH',
        source: 'Reservoir',
        updatedAt: '2026-05-25T00:00:00.000Z',
        confidence: 'collection-floor',
      }),
    );

    useNFTCollectionEstimate({ tokenAddr: CONTRACT, tokenId: 123 });

    await expect(getOptions().queryFn()).resolves.toMatchObject({ floorPriceEth: 0.42 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/nft-estimate?contract=${CONTRACT}`),
    );
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('tokenId=123'));
  });

  it('returns null for unavailable estimates', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockJsonResponse(null));

    useNFTCollectionEstimate({ tokenAddr: CONTRACT });

    await expect(getOptions().queryFn()).resolves.toBeNull();
  });

  it('returns null for rate limits and malformed responses', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockJsonResponse('rate limited', 429))
      .mockResolvedValueOnce(mockJsonResponse({ nope: true }));

    useNFTCollectionEstimate({ tokenAddr: CONTRACT, tokenId: 1 });
    await expect(getOptions().queryFn()).resolves.toBeNull();

    mockUseQuery.mockClear();
    useNFTCollectionEstimate({ tokenAddr: CONTRACT, tokenId: 2 });
    await expect(getOptions().queryFn()).resolves.toBeNull();
  });
});
