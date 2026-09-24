import {
  DEFAULT_PER_PAGE,
  hasActiveFilters,
  pageParam,
  parseGalleryQuery,
  patchSearch,
  perPageParam,
  searchedTokenId,
  sortParam,
  statusParam,
  viewParam,
} from '../galleryQuery';

const parse = (search: string) => parseGalleryQuery(new URLSearchParams(search));

describe('parseGalleryQuery', () => {
  it('reads the default view from an empty URL', () => {
    expect(parse('')).toEqual({
      status: 'all',
      search: '',
      sort: 'newest',
      view: 'grid',
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      traits: {},
      chaos: null,
    });
  });

  it('reads every choice the gallery keeps in the URL', () => {
    expect(
      parse(
        'show=named&q=+chaos+&sort=rarity&view=list&page=3&perPage=48&fate=Ejection&chaos=10-20',
      ),
    ).toEqual({
      status: 'named',
      search: 'chaos',
      sort: 'rarity',
      view: 'list',
      page: 3,
      perPage: 48,
      traits: { fate: ['Ejection'] },
      chaos: [10, 20],
    });
  });

  it('falls back to defaults for values it does not know', () => {
    const query = parse('show=staked&sort=price&view=table&page=-2&perPage=13');
    expect(query.status).toBe('all');
    expect(query.sort).toBe('newest');
    expect(query.view).toBe('grid');
    expect(query.page).toBe(1);
    expect(query.perPage).toBe(DEFAULT_PER_PAGE);
    expect(parse('page=1.5').page).toBe(1);
  });
});

describe('patchSearch', () => {
  it('sets and removes parameters, keeping the rest', () => {
    expect(patchSearch('fate=Ejection&page=2', { page: '', sort: 'oldest' })).toBe(
      '?fate=Ejection&sort=oldest',
    );
  });

  it('returns an empty string once nothing is left', () => {
    expect(patchSearch('page=2', { page: '' })).toBe('');
  });
});

describe('URL values', () => {
  it('omits every default so the plain /gallery is the default view', () => {
    expect(statusParam('all')).toBe('');
    expect(statusParam('anchored')).toBe('anchored');
    expect(sortParam('newest')).toBe('');
    expect(sortParam('chaos-desc')).toBe('chaos-desc');
    expect(viewParam('grid')).toBe('');
    expect(viewParam('list')).toBe('list');
    expect(perPageParam(DEFAULT_PER_PAGE)).toBe('');
    expect(perPageParam(12)).toBe('12');
    expect(pageParam(1)).toBe('');
    expect(pageParam(4)).toBe('4');
  });
});

describe('searchedTokenId', () => {
  it.each([
    ['47', 47],
    ['#47', 47],
    ['#000047', 47],
    [' 0 ', 0],
  ])('reads %p as token %p', (input, expected) => {
    expect(searchedTokenId(input)).toBe(expected);
  });

  it.each(['Chaos', '47a', '#', ''])('treats %p as a name search', (input) => {
    expect(searchedTokenId(input)).toBeNull();
  });
});

describe('hasActiveFilters', () => {
  it('is false for the default view and true once anything narrows it', () => {
    expect(hasActiveFilters(parse(''))).toBe(false);
    // Sort, view and paging reorder or page the collection; they narrow nothing.
    expect(hasActiveFilters(parse('sort=rarity&view=list&page=2'))).toBe(false);
    expect(hasActiveFilters(parse('show=anchored'))).toBe(true);
    expect(hasActiveFilters(parse('q=47'))).toBe(true);
    expect(hasActiveFilters(parse('structure=Time+Chords'))).toBe(true);
    expect(hasActiveFilters(parse('chaos=1-5'))).toBe(true);
  });
});
