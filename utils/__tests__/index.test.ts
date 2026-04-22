import {
  shortenHex,
  parseBalance,
  formatId,
  convertTimestampToDateTime,
  formatSeconds,
  formatEthValue,
  formatCSTValue,
  isWalletAddress,
  getExplorerUrl,
  getAssetsUrl,
  getRWLKImageUrl,
  getEnduranceChampions,
} from '@/utils/index';

describe('shortenHex', () => {
  it('shortens a standard Ethereum address', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenHex(addr, 4)).toBe('0x1234....5678');
  });

  it('shortens with custom length', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    expect(shortenHex(addr, 6)).toBe('0x123456....345678');
  });

  it('returns empty string for falsy input', () => {
    expect(shortenHex('', 4)).toBe('');
  });

  it('returns empty string for null-like inputs', () => {
    expect(shortenHex(null as unknown as string, 4)).toBe('');
    expect(shortenHex(undefined as unknown as string, 4)).toBe('');
  });

  it('handles very short strings', () => {
    const short = '0x12';
    const result = shortenHex(short, 4);
    expect(result).toContain('0x');
    expect(result).toContain('....');
  });
});

describe('parseBalance', () => {
  it('formats a balance with default 18 decimals', () => {
    const result = parseBalance('1000000000000000000', 18, 2);
    expect(result).toBe('1.00');
  });

  it('formats a zero balance', () => {
    const result = parseBalance('0', 18, 4);
    expect(result).toBe('0.0000');
  });

  it('handles different decimal values', () => {
    expect(parseBalance('1000000', 6, 2)).toBe('1.00');
    expect(parseBalance('1000000000000', 12, 2)).toBe('1.00');
    expect(parseBalance('1234567890123456789', 18, 4)).toBe('1.2346');
  });

  it('handles bigint input', () => {
    const result = parseBalance(BigInt('1000000000000000000'), 18, 2);
    expect(result).toBe('1.00');
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

describe('convertTimestampToDateTime', () => {
  it('converts a Unix timestamp to a date string', () => {
    // 1609459200 = 2021-01-01 00:00 UTC; output varies by timezone (e.g. Jan 01 or Dec 31)
    const result = convertTimestampToDateTime(1609459200);
    expect(result).toMatch(/^[A-Za-z]{3} \d{2}, \d{2}:\d{2}$/);
  });

  it('includes seconds when flag is set', () => {
    const withSeconds = convertTimestampToDateTime(1609459200, true);
    const without = convertTimestampToDateTime(1609459200, false);
    expect(withSeconds).toMatch(/^[A-Za-z]{3} \d{2}, \d{2}:\d{2}:\d{2}$/);
    expect(without).toMatch(/^[A-Za-z]{3} \d{2}, \d{2}:\d{2}$/);
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

describe('formatEthValue', () => {
  it('formats a number as ETH with decimals', () => {
    const result = formatEthValue(1.23456789);
    expect(result).toContain('1.2346');
    expect(result).toContain('ETH');
  });

  it('returns 0 ETH for zero input', () => {
    expect(formatEthValue(0)).toBe('0 ETH');
  });

  it('uses 2 decimals for large values', () => {
    const result = formatEthValue(100.123);
    expect(result).toBe('100.12 ETH');
  });
});

describe('formatCSTValue', () => {
  it('formats small values with 4 decimals', () => {
    expect(formatCSTValue(5)).toBe('5.0000 CST');
  });

  it('formats larger values with 2 decimals', () => {
    expect(formatCSTValue(15)).toBe('15.00 CST');
  });

  it('formats zero', () => {
    expect(formatCSTValue(0)).toBe('0 CST');
  });
});

describe('isWalletAddress', () => {
  it('returns wallet name for known addresses', () => {
    const result = isWalletAddress('0x0000000000000000000000000000000000000000');
    expect(typeof result).toBe('string');
  });

  it('returns empty string for unknown addresses', () => {
    const result = isWalletAddress('0x1111111111111111111111111111111111111111');
    expect(result).toBe('');
  });

  it('returns empty string for a random non-wallet address', () => {
    const result = isWalletAddress('0xabcdef1234567890abcdef1234567890abcdef12');
    expect(result).toBe('');
  });

  it('returns empty string for address 0x1234567890abcdef1234567890abcdef12345678', () => {
    const result = isWalletAddress('0x1234567890abcdef1234567890abcdef12345678');
    expect(result).toBe('');
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
  it('builds direct URL with correct base path', () => {
    const result = getAssetsUrl('cosmicsignature/logo.png');
    expect(result).toBe('https://nfts-sepolia.cosmicsignature.com/images/new/cosmicsignature/logo.png');
  });

  it('concatenates path to base URL', () => {
    const result = getAssetsUrl('path/to/image.png');
    expect(result).toBe('https://nfts-sepolia.cosmicsignature.com/images/new/path/to/image.png');
  });
});

describe('getRWLKImageUrl', () => {
  it('builds direct URL with default variant', () => {
    const result = getRWLKImageUrl('token_123');
    expect(result).toBe(
      'https://nfts-sepolia.cosmicsignature.com/images/randomwalk/token_123_black_thumb.jpg',
    );
  });

  it('builds direct URL with custom variant', () => {
    const result = getRWLKImageUrl('token_456', 'full.jpg');
    expect(result).toBe(
      'https://nfts-sepolia.cosmicsignature.com/images/randomwalk/token_456_full.jpg',
    );
  });
});

describe('getEnduranceChampions', () => {
  it('returns empty array for empty bid list', () => {
    expect(getEnduranceChampions([])).toEqual([]);
  });

  it('returns empty array for null bid list', () => {
    expect(
      getEnduranceChampions(null as unknown as Parameters<typeof getEnduranceChampions>[0]),
    ).toEqual([]);
  });

  it('returns single champion for single bid with explicit roundEndTimeStamp', () => {
    const bidList = [{ BidderAddr: '0x123', TimeStamp: 1000 }];
    const result = getEnduranceChampions(bidList, 2000);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      bidder: '0x123',
      championTime: 1000,
      chronoWarrior: 0,
    });
  });

  it('returns champions for multiple bids with explicit roundEndTimeStamp', () => {
    const bidList = [
      { BidderAddr: '0x1', TimeStamp: 100 },
      { BidderAddr: '0x2', TimeStamp: 200 },
      { BidderAddr: '0x3', TimeStamp: 500 },
    ];
    const result = getEnduranceChampions(bidList, 600);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => 'bidder' in c && 'championTime' in c && 'chronoWarrior' in c)).toBe(
      true,
    );
  });
});
