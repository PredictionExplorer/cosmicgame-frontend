import { foldForSearch, parseJumpQuery, searchEntries, type SearchEntry } from '../siteSearch';

describe('parseJumpQuery', () => {
  const address = '0x1Ec14a0000000000000000000000000000d7E990';

  it('opens a participant page for an address', () => {
    expect(parseJumpQuery(` ${address} `)).toEqual([
      { kind: 'address', value: address, path: `/user/${address}` },
    ]);
  });

  it('offers the explorer for a transaction hash', () => {
    const hash = `0x${'ab'.repeat(32)}`;
    expect(parseJumpQuery(hash)).toEqual([{ kind: 'transaction', value: hash }]);
  });

  it('reads a bare number as a token, a cycle and a gesture, token first', () => {
    expect(parseJumpQuery('25').map((jump) => jump.kind)).toEqual(['token', 'cycle', 'gesture']);
    expect(parseJumpQuery('#25')[0]).toEqual({ kind: 'token', value: 25, path: '/detail/25' });
  });

  it.each([
    ['cycle 3', { kind: 'cycle', value: 3, path: '/allocation/3' }],
    ['Cycle #3', { kind: 'cycle', value: 3, path: '/allocation/3' }],
    ['gesture 1135', { kind: 'gesture', value: 1135, path: '/gesture/1135' }],
    ['nft 7', { kind: 'token', value: 7, path: '/detail/7' }],
    ['token#7', { kind: 'token', value: 7, path: '/detail/7' }],
  ])('reads "%s" as one jump', (query, jump) => {
    expect(parseJumpQuery(query)).toEqual([jump]);
  });

  it('ignores text, partial addresses and oversized numbers', () => {
    expect(parseJumpQuery('')).toEqual([]);
    expect(parseJumpQuery('gallery')).toEqual([]);
    expect(parseJumpQuery('0x1234')).toEqual([]);
    expect(parseJumpQuery('12345678901')).toEqual([]);
  });
});

describe('foldForSearch', () => {
  it('folds case, diacritics and width', () => {
    expect(foldForSearch('Thống kê')).toBe('thong ke');
    expect(foldForSearch('Đài quan sát')).toBe('dai quan sat');
    expect(foldForSearch('ＦＡＱ')).toBe('faq');
  });
});

describe('searchEntries', () => {
  const entries: SearchEntry[] = [
    { id: 'gallery', label: 'Gallery', description: 'Every Signature', keywords: ['/gallery'] },
    {
      id: 'statistics',
      label: 'Statistics',
      description: 'Protocol-wide figures',
      keywords: ['Explore', '/statistics'],
    },
    {
      id: 'tokens',
      label: 'Token Distribution Statistics',
      description: 'CST and NFT supply',
      keywords: ['Explore', '/statistics/tokens'],
    },
    { id: 'faq', label: 'Thống kê giao thức', description: '', keywords: [] },
  ];

  it('returns everything, in order, for an empty query', () => {
    expect(searchEntries(entries, '  ').map((entry) => entry.id)).toEqual([
      'gallery',
      'statistics',
      'tokens',
      'faq',
    ]);
  });

  it('ranks label prefixes above words inside labels', () => {
    expect(searchEntries(entries, 'stat').map((entry) => entry.id)).toEqual([
      'statistics',
      'tokens',
    ]);
  });

  it('needs every term to match somewhere', () => {
    expect(searchEntries(entries, 'token supply').map((entry) => entry.id)).toEqual(['tokens']);
    expect(searchEntries(entries, 'token gallery')).toEqual([]);
  });

  it('matches paths and section names, and ignores diacritics', () => {
    expect(searchEntries(entries, 'explore').map((entry) => entry.id)).toEqual([
      'statistics',
      'tokens',
    ]);
    expect(searchEntries(entries, 'thong ke').map((entry) => entry.id)).toEqual(['faq']);
  });
});
