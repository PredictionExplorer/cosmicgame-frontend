import {
  shortenHex,
  formatId,
  formatSeconds,
  getExplorerUrl,
  getAssetsUrl,
  getRWLKImageUrl,
  getEnduranceChampions,
} from '@/utils/index';

describe('shortenHex', () => {
  it('shortens a standard Ethereum address to the checksummed 0x + 4 … 4 form', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenHex(addr, 4)).toBe('0x1234…\u20605678');
  });

  it('ignores the legacy length so every address reads the same', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenHex(addr, 6)).toBe('0x1234…\u20605678');
  });

  it('returns empty string for falsy input', () => {
    expect(shortenHex('', 4)).toBe('');
  });

  it('returns empty string for null-like inputs', () => {
    expect(shortenHex(null as unknown as string, 4)).toBe('');
    expect(shortenHex(undefined as unknown as string, 4)).toBe('');
  });

  it('returns strings too short to shorten unchanged', () => {
    expect(shortenHex('0x12', 4)).toBe('0x12');
  });
});

describe('formatId', () => {
  it('pads a number to 6 digits with # prefix', () => {
    expect(formatId(42)).toBe('#000042');
  });

  it('pads larger numbers', () => {
    expect(formatId(123456)).toBe('#123456');
  });
});

describe('formatSeconds', () => {
  it('formats seconds into time string', () => {
    const result = formatSeconds(3661);
    expect(result).toContain('1h');
    expect(result).toContain('1m');
    expect(result).toContain('1s');
  });

  it('formats zero seconds', () => {
    const result = formatSeconds(0);
    expect(result).toContain('0s');
  });

  it('returns space for negative values', () => {
    expect(formatSeconds(-1).trim()).toBe('');
  });
});

describe('getExplorerUrl', () => {
  it('constructs correct URL for tx type', () => {
    const result = getExplorerUrl('tx', '0xabc123');
    expect(result).toMatch(/\/tx\/0xabc123$/);
    expect(result).not.toContain('/address/');
    expect(result).not.toContain('/token/');
  });

  it('constructs correct URL for address type', () => {
    const result = getExplorerUrl('address', '0x1234567890123456789012345678901234567890');
    expect(result).toMatch(/\/address\/0x1234567890123456789012345678901234567890$/);
  });

  it('constructs correct URL for token type', () => {
    const result = getExplorerUrl('token', '0xTokenAddr');
    expect(result).toMatch(/\/token\/0xTokenAddr$/);
  });

  it('uses explorer base URL from config', () => {
    const txResult = getExplorerUrl('tx', '0x1');
    const addrResult = getExplorerUrl('address', '0x2');
    expect(txResult).toContain('/tx/');
    expect(addrResult).toContain('/address/');
  });
});

describe('getAssetsUrl', () => {
  // Media follows the rotated API origin (jest.setup.ts NEXT_PUBLIC_API_URL).
  const nftBase = 'http://test-api.example';

  it('builds direct URL with correct base path', () => {
    const result = getAssetsUrl('cosmicsignature/logo.png');
    expect(result).toBe(`${nftBase}/images/new/cosmicsignature/logo.png`);
  });

  it('concatenates path to base URL', () => {
    const result = getAssetsUrl('path/to/image.png');
    expect(result).toBe(`${nftBase}/images/new/path/to/image.png`);
  });
});

describe('getRWLKImageUrl', () => {
  // Media follows the rotated API origin (jest.setup.ts NEXT_PUBLIC_API_URL).
  const nftBase = 'http://test-api.example';

  it('builds direct URL with default variant', () => {
    const result = getRWLKImageUrl('token_123');
    expect(result).toBe(`${nftBase}/images/randomwalk/token_123_black_thumb.jpg`);
  });

  it('builds direct URL with custom variant', () => {
    const result = getRWLKImageUrl('token_456', 'full.jpg');
    expect(result).toBe(`${nftBase}/images/randomwalk/token_456_full.jpg`);
  });
});

describe('getEnduranceChampions', () => {
  it('returns empty array for empty gesture list', () => {
    expect(getEnduranceChampions([])).toEqual([]);
  });

  it('returns empty array for null gesture list', () => {
    expect(
      getEnduranceChampions(null as unknown as Parameters<typeof getEnduranceChampions>[0]),
    ).toEqual([]);
  });

  it('returns single champion for single gesture with explicit roundEndTimeStamp', () => {
    const gestureList = [{ BidderAddr: '0x123', TimeStamp: 1000 }];
    const result = getEnduranceChampions(gestureList, 2000);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      participant: '0x123',
      championTime: 1000,
      chronoWarrior: 0,
    });
  });

  it('returns champions for multiple gestures with explicit roundEndTimeStamp', () => {
    const gestureList = [
      { BidderAddr: '0x1', TimeStamp: 100 },
      { BidderAddr: '0x2', TimeStamp: 200 },
      { BidderAddr: '0x3', TimeStamp: 500 },
    ];
    const result = getEnduranceChampions(gestureList, 600);
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((c) => 'participant' in c && 'championTime' in c && 'chronoWarrior' in c),
    ).toBe(true);
  });
});
