import { parseCanonicalNonNegativeSafeInteger, parseGestureId, parseTokenId } from '../routeParams';

describe('parseCanonicalNonNegativeSafeInteger', () => {
  it.each([
    ['0', 0],
    ['1', 1],
    ['42', 42],
    [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER],
  ])('accepts canonical cycle ID %s', (raw, expected) => {
    expect(parseCanonicalNonNegativeSafeInteger(raw)).toBe(expected);
  });

  it.each([
    '',
    '-1',
    '+1',
    '01',
    '00',
    '1.0',
    '1e2',
    '12abc',
    ' 1',
    '1 ',
    String(Number.MAX_SAFE_INTEGER + 1),
  ])('rejects non-canonical or unsafe cycle ID %j', (raw) => {
    expect(parseCanonicalNonNegativeSafeInteger(raw)).toBeNull();
  });
});

describe('parseTokenId', () => {
  it.each([
    ['0', 0],
    ['25', 25],
    ['000025', 25],
  ])('reads %s as %d', (id, expected) => {
    expect(parseTokenId(id)).toBe(expected);
  });

  it.each(['not-a-token', '-1', '1.5', '', '1e3', '99999999999999999999'])('refuses %p', (id) => {
    expect(parseTokenId(id)).toBeNull();
  });
});

describe('parseGestureId', () => {
  it.each([
    ['0', 0],
    ['29434', 29434],
  ])('reads %s as %d', (id, expected) => {
    expect(parseGestureId(id)).toBe(expected);
  });

  // "12abc" is an invalid id, never gesture 12.
  it.each(['12abc', 'abc', '-3', '1.5', '', '99999999999999999999'])('refuses %p', (id) => {
    expect(parseGestureId(id)).toBeNull();
  });
});
