import {
  isAddressParam,
  isSystemEventWindowParams,
  parseAnchorActionParams,
  parseCanonicalNonNegativeSafeInteger,
  parseGestureId,
  parseTokenId,
} from '../routeParams';

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

describe('parseAnchorActionParams', () => {
  it('reads the collection flag and a canonical action id', () => {
    expect(parseAnchorActionParams('1', '23')).toEqual({ isRwalk: 1, actionId: 23 });
  });

  it('rejects any other flag or a non-canonical id', () => {
    expect(parseAnchorActionParams('2', '23')).toBeNull();
    expect(parseAnchorActionParams('0', '023')).toBeNull();
  });
});

describe('isAddressParam', () => {
  it.each([
    '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c',
    '0x7406b34d25a9b7841cac133e3173919e0af6bc6c',
    ' 0x7406b34d25a9b7841cac133e3173919e0af6bc6c ',
  ])('reads %j as an address', (raw) => {
    expect(isAddressParam(raw)).toBe(true);
  });

  it.each([
    '',
    '0x12',
    'abc',
    '0x7406b34d25a9b7841cac133e3173919e0af6bc6g',
    '7406b34d25a9b7841cac133e3173919e0af6bc6c00',
  ])('rejects %j', (raw) => {
    expect(isAddressParam(raw)).toBe(false);
  });
});

describe('isSystemEventWindowParams', () => {
  it.each([
    ['2', '200', '350'],
    ['0', '-1', '99'],
    ['3', '350', '350'],
  ])('reads cycle %s, events %s to %s as a window', (round, start, end) => {
    expect(isSystemEventWindowParams(round, start, end)).toBe(true);
  });

  it.each([
    ['2', '350', '200'],
    ['2', '0200', '350'],
    ['-1', '200', '350'],
    ['2', '-2', '350'],
    ['2', '200', '3.5'],
    ['abc', '200', '350'],
  ])('rejects cycle %s, events %s to %s', (round, start, end) => {
    expect(isSystemEventWindowParams(round, start, end)).toBe(false);
  });
});
