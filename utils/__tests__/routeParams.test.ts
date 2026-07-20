import { parseCanonicalNonNegativeSafeInteger } from '../routeParams';

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
