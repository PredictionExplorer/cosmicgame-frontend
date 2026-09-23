import {
  initialDurationSeconds,
  percentFromDivisor,
  secondsFromMicroseconds,
  secondsOrNull,
} from '../protocolParams';

describe('percentFromDivisor', () => {
  it('turns a divisor into its percentage', () => {
    expect(percentFromDivisor(100)).toBe(1);
    expect(percentFromDivisor('100')).toBe(1);
    expect(percentFromDivisor(250n)).toBe(0.4);
  });

  it.each([undefined, null, 0, -5, '', 'not-a-number', Number.NaN])(
    'reports %p as unknown instead of a percentage',
    (divisor) => {
      expect(percentFromDivisor(divisor)).toBeNull();
    },
  );
});

describe('durations', () => {
  it('converts microseconds to seconds', () => {
    expect(secondsFromMicroseconds('3672360000')).toBe(3672.36);
    expect(secondsFromMicroseconds(undefined)).toBeNull();
    expect(secondsFromMicroseconds(-1)).toBeNull();
  });

  it('keeps seconds and rejects unusable values', () => {
    expect(secondsOrNull(172800)).toBe(172800);
    expect(secondsOrNull(0)).toBe(0);
    expect(secondsOrNull(undefined)).toBeNull();
  });

  it('derives the initial Cycle Finalization Time from the increment and its divisor', () => {
    // Production: a 3,672.36 s increment and divisor 41,667 give about 24.5 hours.
    expect(initialDurationSeconds('3672360000', 41667)).toBe(88135);
    expect(initialDurationSeconds('3672360000', 0)).toBeNull();
    expect(initialDurationSeconds(undefined, 41667)).toBeNull();
  });
});
