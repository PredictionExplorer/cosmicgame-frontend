// lexicon-allow-start: fixtures mirror sealed backend wire field names
import { getGestureKindLabel, resolveGestureTypeCode } from '../gestures';

describe('resolveGestureTypeCode', () => {
  it('returns the normalised GestureType when the API sends one', () => {
    expect(resolveGestureTypeCode({ GestureType: 2 })).toBe(2);
  });

  it('falls back to the raw backend field when GestureType is absent', () => {
    expect(resolveGestureTypeCode({ BidType: 1 })).toBe(1);
  });

  it('prefers GestureType over the legacy field when both are present', () => {
    expect(resolveGestureTypeCode({ GestureType: 0, BidType: 2 })).toBe(0);
  });

  it('treats code 0 as a real method rather than a missing one', () => {
    // 0 is the ETH method; a truthiness check here would silently fall
    // through to the legacy field and mislabel every ETH gesture.
    expect(resolveGestureTypeCode({ GestureType: 0, BidType: 1 })).toBe(0);
    expect(resolveGestureTypeCode({ BidType: 0 })).toBe(0);
  });

  it('returns undefined for a record carrying neither field', () => {
    expect(resolveGestureTypeCode({})).toBeUndefined();
  });

  it('returns undefined when the fields are present but not numeric', () => {
    expect(resolveGestureTypeCode({ GestureType: '2', BidType: '1' })).toBeUndefined();
    expect(resolveGestureTypeCode({ GestureType: null, BidType: undefined })).toBeUndefined();
  });

  it('skips a non-numeric GestureType and still reads the legacy field', () => {
    expect(resolveGestureTypeCode({ GestureType: 'cst', BidType: 2 })).toBe(2);
  });

  it('passes through an unexpected numeric code instead of clamping it', () => {
    // Forward compatibility: a new on-chain method should reach the caller
    // rather than being silently coerced into an existing one.
    expect(resolveGestureTypeCode({ GestureType: 7 })).toBe(7);
  });

  it('does not treat NaN as a resolvable code by accident', () => {
    // NaN is typeof number, so it flows through; callers compare against
    // 1 and 2, and NaN matches neither, which is the safe outcome.
    expect(getGestureKindLabel(resolveGestureTypeCode({ GestureType: NaN }))).toBe(
      'an ETH gesture',
    );
  });
});

describe('getGestureKindLabel', () => {
  it('labels the CST method', () => {
    expect(getGestureKindLabel(2)).toBe('a CST gesture');
  });

  it('labels the ETH + RandomWalk method', () => {
    expect(getGestureKindLabel(1)).toBe('an ETH + RandomWalk gesture');
  });

  it('labels the plain ETH method', () => {
    expect(getGestureKindLabel(0)).toBe('an ETH gesture');
  });

  it('falls back to the ETH label for an unknown or missing code', () => {
    expect(getGestureKindLabel(undefined)).toBe('an ETH gesture');
    expect(getGestureKindLabel(null)).toBe('an ETH gesture');
    expect(getGestureKindLabel(99)).toBe('an ETH gesture');
  });

  it('requires a strict numeric match, so a stringified code is not a CST gesture', () => {
    expect(getGestureKindLabel('2')).toBe('an ETH gesture');
  });

  it('reads end to end from a backend record', () => {
    const record = { BidType: 2 };

    expect(getGestureKindLabel(resolveGestureTypeCode(record))).toBe('a CST gesture');
  });
});
// lexicon-allow-end
