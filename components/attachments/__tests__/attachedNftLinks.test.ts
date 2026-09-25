import {
  buildOpenSeaAssetUrl,
  getAttachedNftTokenId,
  nameCarriesTokenId,
  normalizeHttpUrl,
  normalizeHttpsUrl,
  resolveAttachedNftExplorerLink,
  resolveAttachedNftLink,
  resolveAttachedNftProjectLink,
} from '../attachedNftLinks';

const CONTRACT = '0x1234567890abcdef1234567890abcdef12345678';

describe('attachedNftLinks', () => {
  describe('nameCarriesTokenId', () => {
    it('finds the number in a padded or plain name', () => {
      expect(nameCarriesTokenId('Random Walk #004079', '4079')).toBe(true);
      expect(nameCarriesTokenId('GBC #8489', '8489')).toBe(true);
    });

    it('does not match a number that only contains the id', () => {
      expect(nameCarriesTokenId('Rexy #31140', '3114')).toBe(false);
      expect(nameCarriesTokenId('Sky Study', '7')).toBe(false);
      expect(nameCarriesTokenId('GBC #8489', null)).toBe(false);
    });
  });

  describe('getAttachedNftTokenId', () => {
    it('prefers NFTTokenId over TokenId', () => {
      expect(getAttachedNftTokenId({ NFTTokenId: 42, TokenId: 7 })).toBe('42');
    });

    it('supports string, zero, and large token ids', () => {
      expect(getAttachedNftTokenId({ NFTTokenId: '0' })).toBe('0');
      expect(getAttachedNftTokenId({ NFTTokenId: '999999999999999999999' })).toBe(
        '999999999999999999999',
      );
    });

    it('returns null when both token ids are absent or blank', () => {
      expect(getAttachedNftTokenId({})).toBeNull();
      expect(getAttachedNftTokenId({ NFTTokenId: '   ' })).toBeNull();
    });
  });

  describe('normalizeHttpUrl', () => {
    it('keeps valid http and https urls', () => {
      expect(normalizeHttpUrl('https://example.com/nft')).toBe('https://example.com/nft');
      expect(normalizeHttpUrl('http://example.com/nft')).toBe('http://example.com/nft');
    });

    it('rejects unsafe and unsupported urls', () => {
      expect(normalizeHttpUrl('javascript:alert(1)')).toBeNull();
      expect(normalizeHttpUrl('data:text/html,hello')).toBeNull();
      expect(normalizeHttpUrl('ipfs://cid')).toBeNull();
      expect(normalizeHttpUrl('not a url')).toBeNull();
      expect(normalizeHttpUrl('')).toBeNull();
    });
  });

  describe('normalizeHttpsUrl', () => {
    it('keeps https and refuses plain http and other schemes', () => {
      expect(normalizeHttpsUrl('https://example.com/nft')).toBe('https://example.com/nft');
      expect(normalizeHttpsUrl('http://example.com/nft')).toBeNull();
      expect(normalizeHttpsUrl('javascript:alert(1)')).toBeNull();
      expect(normalizeHttpsUrl(undefined)).toBeNull();
    });
  });

  describe('resolveAttachedNftProjectLink', () => {
    it('names the host of the site the metadata points to', () => {
      expect(
        resolveAttachedNftProjectLink({
          external_url: 'https://www.randomwalknft.com/detail/4079',
        }),
      ).toEqual({ href: 'https://www.randomwalknft.com/detail/4079', host: 'randomwalknft.com' });
    });

    it('offers no link for plain http or an unusable value', () => {
      expect(
        resolveAttachedNftProjectLink({ external_url: 'http://project.example/1' }),
      ).toBeNull();
      expect(resolveAttachedNftProjectLink({ external_url: 'javascript:alert(1)' })).toBeNull();
      expect(resolveAttachedNftProjectLink(null)).toBeNull();
    });
  });

  describe('buildOpenSeaAssetUrl', () => {
    it('builds Arbitrum mainnet OpenSea urls', () => {
      expect(buildOpenSeaAssetUrl(CONTRACT, 123, 42161)).toBe(
        `https://opensea.io/assets/arbitrum/${CONTRACT}/123`,
      );
    });

    it('builds Arbitrum Sepolia OpenSea urls for testnet-like chains', () => {
      expect(buildOpenSeaAssetUrl(CONTRACT, '123', 421614)).toBe(
        `https://testnets.opensea.io/assets/arbitrum-sepolia/${CONTRACT}/123`,
      );
      expect(buildOpenSeaAssetUrl(CONTRACT, '123', 31337)).toBe(
        `https://testnets.opensea.io/assets/arbitrum-sepolia/${CONTRACT}/123`,
      );
    });

    it('encodes token ids and rejects invalid input', () => {
      expect(buildOpenSeaAssetUrl(CONTRACT, 'token id', 42161)).toBe(
        `https://opensea.io/assets/arbitrum/${CONTRACT}/token%20id`,
      );
      expect(buildOpenSeaAssetUrl('0xBad', 1, 42161)).toBeNull();
      expect(buildOpenSeaAssetUrl(CONTRACT, '', 42161)).toBeNull();
      expect(buildOpenSeaAssetUrl('', 1, 42161)).toBeNull();
    });
  });

  describe('resolveAttachedNftLink', () => {
    it('links to OpenSea, from the recorded contract and token', () => {
      const result = resolveAttachedNftLink({
        nft: { TokenAddr: CONTRACT, NFTTokenId: 1 },
        chainId: 42161,
      });
      expect(result).toEqual({
        kind: 'opensea',
        href: `https://opensea.io/assets/arbitrum/${CONTRACT}/1`,
        label: 'View on OpenSea',
      });
    });

    it('falls back to explorer when OpenSea cannot be built', () => {
      const result = resolveAttachedNftLink({
        nft: { TokenAddr: CONTRACT },
        chainId: 42161,
      });
      expect(result.kind).toBe('explorer');
      expect(result.href).toContain(CONTRACT);
    });

    it('returns none when no usable target exists', () => {
      const result = resolveAttachedNftLink({
        nft: {},
        chainId: 42161,
      });
      expect(result).toEqual({
        kind: 'none',
        href: null,
        label: 'NFT details unavailable',
      });
    });
  });

  describe('resolveAttachedNftExplorerLink', () => {
    it('builds explorer links when contract exists', () => {
      const result = resolveAttachedNftExplorerLink({ TokenAddr: CONTRACT });
      expect(result.kind).toBe('explorer');
      expect(result.href).toContain(CONTRACT);
    });

    it('returns disabled state when contract is absent', () => {
      expect(resolveAttachedNftExplorerLink({})).toEqual({
        kind: 'none',
        href: null,
        label: 'Contract unavailable',
      });
    });
  });
});
