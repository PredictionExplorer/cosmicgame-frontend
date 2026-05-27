import { normalizeTokenLogoUrl, resolveTokenLogo } from '../tokenLogos';

const WETH_ARBITRUM = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const UNKNOWN = '0x1111111111111111111111111111111111111111';

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('normalizeTokenLogoUrl', () => {
  it('accepts http and https urls', () => {
    expect(normalizeTokenLogoUrl('https://cdn.example/logo.png')).toBe(
      'https://cdn.example/logo.png',
    );
    expect(normalizeTokenLogoUrl('http://cdn.example/logo.png')).toBe(
      'http://cdn.example/logo.png',
    );
  });

  it('normalizes ipfs urls through the gateway', () => {
    expect(normalizeTokenLogoUrl('ipfs://bafy/logo.png')).toBe(
      'https://ipfs.io/ipfs/bafy/logo.png',
    );
    expect(normalizeTokenLogoUrl('ipfs://ipfs/bafy/logo.png')).toBe(
      'https://ipfs.io/ipfs/bafy/logo.png',
    );
  });

  it('rejects unsafe or empty logo urls', () => {
    expect(normalizeTokenLogoUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeTokenLogoUrl('')).toBeNull();
    expect(normalizeTokenLogoUrl(null)).toBeNull();
  });
});

describe('resolveTokenLogo', () => {
  it('finds local override logos by normalized address and chain id', async () => {
    const fetchImpl = jest.fn();
    const mixedCaseAddress = `0x${WETH_ARBITRUM.slice(2).toUpperCase()}`;

    await expect(
      resolveTokenLogo({ chainId: 42161, address: mixedCaseAddress, fetchImpl }),
    ).resolves.toMatchObject({
      logoURI: expect.stringContaining('trustwallet'),
      source: 'Trust Wallet',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('finds logos in curated token lists', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      mockJsonResponse({
        tokens: [
          {
            chainId: 42161,
            address: UNKNOWN,
            logoURI: 'ipfs://bafy/logo.png',
          },
        ],
      }),
    );

    await expect(
      resolveTokenLogo({ chainId: 42161, address: UNKNOWN, fetchImpl }),
    ).resolves.toEqual({
      logoURI: 'https://ipfs.io/ipfs/bafy/logo.png',
      source: 'tokens.coingecko.com',
    });
  });

  it('returns null for invalid addresses without fetching', async () => {
    const fetchImpl = jest.fn();

    await expect(
      resolveTokenLogo({ chainId: 42161, address: '0xBad', fetchImpl }),
    ).resolves.toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns null for unknown tokens and provider failures', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('network unavailable'));

    await expect(
      resolveTokenLogo({ chainId: 42161, address: UNKNOWN, fetchImpl }),
    ).resolves.toBeNull();
  });
});
