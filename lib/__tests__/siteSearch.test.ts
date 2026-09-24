import { routing } from '@/i18n/routing';

import {
  JUMP_KEYWORDS,
  foldForSearch,
  jumpKeywordsFor,
  parseJumpQuery,
  searchEntries,
  type SearchEntry,
} from '../siteSearch';

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
    expect(parseJumpQuery('gallery 3')).toEqual([]);
    expect(parseJumpQuery('cycle 3 gesture')).toEqual([]);
  });

  it('reads "ID" after a keyword and a keyword after the number', () => {
    expect(parseJumpQuery('Gesture ID 1135')).toEqual([
      { kind: 'gesture', value: 1135, path: '/gesture/1135' },
    ]);
    expect(parseJumpQuery('3 cycle')).toEqual([{ kind: 'cycle', value: 3, path: '/allocation/3' }]);
  });

  it.each([
    ['zh', '周期 3', 'cycle'],
    ['zh', '落笔 ID 1135', 'gesture'],
    ['zh-TW', '週期3', 'cycle'],
    ['zh-HK', '簽名作品 7', 'token'],
    ['uk', 'Цикл 3', 'cycle'],
    ['uk', 'жест 1135', 'gesture'],
    ['ko', '사이클 3', 'cycle'],
    ['ko', '제스처 1135', 'gesture'],
    ['ja', 'サイクル3', 'cycle'],
    ['ja', '一筆ID1135', 'gesture'],
    ['ja', 'シグネチャー 7', 'token'],
    ['vi', 'Chu kỳ 3', 'cycle'],
    ['vi', 'chu ky 3', 'cycle'],
    ['vi', 'nét bút 1135', 'gesture'],
    ['ja', 'cycle 3', 'cycle'],
  ])('in %s reads "%s" as a %s', (locale, query, kind) => {
    const jumps = parseJumpQuery(query, jumpKeywordsFor(locale));
    expect(jumps).toHaveLength(1);
    expect(jumps[0]!.kind).toBe(kind);
  });

  it('reads full-width digits as the number they are', () => {
    expect(parseJumpQuery('サイクル３', jumpKeywordsFor('ja'))).toEqual([
      { kind: 'cycle', value: 3, path: '/allocation/3' },
    ]);
  });

  it('keeps English keywords working in every locale', () => {
    for (const locale of routing.locales) {
      const keywords = jumpKeywordsFor(locale);
      for (const kind of ['token', 'cycle', 'gesture'] as const) {
        expect(keywords[kind]).toEqual(expect.arrayContaining([...JUMP_KEYWORDS.en[kind]]));
        expect(keywords[kind].length).toBeGreaterThan(0);
      }
    }
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
