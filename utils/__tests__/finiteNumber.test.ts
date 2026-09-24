import { toFiniteNumber } from '../finiteNumber';

describe('toFiniteNumber', () => {
  it.each([
    [0, 0],
    [-2.5, -2.5],
    [12n, 12],
    ['7', 7],
    [' 0.25 ', 0.25],
    ['1e3', 1000],
  ])('reads %p as %p', (input, expected) => {
    expect(toFiniteNumber(input)).toBe(expected);
  });

  it.each([
    undefined,
    null,
    '',
    '   ',
    'abc',
    Number.NaN,
    Number.POSITIVE_INFINITY,
    true,
    {},
    [],
    10n ** 400n,
  ])('reads %p as unknown', (input) => {
    expect(toFiniteNumber(input)).toBeNull();
  });
});
