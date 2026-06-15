import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
}));

jest.mock('wagmi', () => ({
  usePublicClient: jest.fn(),
}));

import { networkConfig } from '@/config/networks';

import { useAttachedErc20Metadata } from '../useAttachedErc20Metadata';

const mockUseQuery = useQuery as jest.Mock;
const mockUsePublicClient = usePublicClient as jest.Mock;
const TOKEN = '0x1111111111111111111111111111111111111111';

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  };
}

function getOptions() {
  return mockUseQuery.mock.calls[0]![0] as {
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
    enabled: boolean;
  };
}

describe('useAttachedErc20Metadata', () => {
  const originalFetch = global.fetch;
  const readContract = jest.fn();

  beforeEach(() => {
    mockUseQuery.mockClear();
    readContract.mockClear();
    readContract.mockImplementation(({ functionName }: { functionName: string }) => {
      if (functionName === 'symbol') return Promise.resolve('GLXY');
      if (functionName === 'decimals') return Promise.resolve(6);
      if (functionName === 'name') return Promise.resolve('Galaxy Credits');
      return Promise.resolve(undefined);
    });
    mockUsePublicClient.mockReturnValue({ readContract });
    global.fetch = jest.fn().mockResolvedValue(
      mockJsonResponse({
        logoURI: 'https://cdn.example/glxy.png',
        source: 'Token List',
      }),
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('configures a disabled query for invalid addresses', () => {
    useAttachedErc20Metadata('0xBad');

    expect(getOptions()).toMatchObject({
      enabled: false,
    });
  });

  it('combines on-chain display metadata with logo metadata', async () => {
    useAttachedErc20Metadata(TOKEN);

    const options = getOptions();
    expect(options.enabled).toBe(true);
    expect(options.queryKey).toEqual(['attachedErc20Metadata', networkConfig.chainId, TOKEN]);
    await expect(options.queryFn()).resolves.toEqual({
      name: 'Galaxy Credits',
      symbol: 'GLXY',
      decimals: 6,
      logoURI: 'https://cdn.example/glxy.png',
      logoSource: 'Token List',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/token-metadata?address=${TOKEN}&chainId=${networkConfig.chainId}`,
      expect.any(Object),
    );
  });

  it('keeps working when logo lookup fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('no logo'));
    useAttachedErc20Metadata(TOKEN);

    await expect(getOptions().queryFn()).resolves.toMatchObject({
      name: 'Galaxy Credits',
      symbol: 'GLXY',
      decimals: 6,
    });
  });

  it('falls back when public client is unavailable', async () => {
    mockUsePublicClient.mockReturnValue(null);
    useAttachedErc20Metadata(TOKEN);

    await expect(getOptions().queryFn()).resolves.toMatchObject({
      decimals: 18,
      logoURI: 'https://cdn.example/glxy.png',
    });
    expect(readContract).not.toHaveBeenCalled();
  });
});
