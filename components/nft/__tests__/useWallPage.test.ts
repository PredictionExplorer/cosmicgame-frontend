import { parseWallPage, wallPageSearch } from '../useWallPage';

describe('parseWallPage', () => {
  it.each([
    [null, 1],
    ['', 1],
    ['2', 2],
    ['0', 1],
    ['-3', 1],
    ['2.5', 1],
    ['abc', 1],
  ])('reads %p as page %p', (value, page) => {
    expect(parseWallPage(value)).toBe(page);
  });
});

describe('wallPageSearch', () => {
  it('sets the page and keeps the other parameters', () => {
    expect(wallPageSearch('show=named', 3)).toBe('?show=named&page=3');
  });

  it('drops the parameter for the first page', () => {
    expect(wallPageSearch('page=4', 1)).toBe('');
    expect(wallPageSearch('page=4&show=named', 1)).toBe('?show=named');
  });
});
