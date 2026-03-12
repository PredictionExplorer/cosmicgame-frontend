import { getRelativeTime } from '../time';

const NOW = 1_700_000_000;

describe('getRelativeTime', () => {
  it('returns "just now" for timestamps less than a minute ago', () => {
    expect(getRelativeTime(NOW - 30, NOW)).toBe('just now');
  });

  it('returns "just now" for zero difference', () => {
    expect(getRelativeTime(NOW, NOW)).toBe('just now');
  });

  it('returns "just now" for future timestamps', () => {
    expect(getRelativeTime(NOW + 100, NOW)).toBe('just now');
  });

  it('returns "1 minute ago" for 60s diff', () => {
    expect(getRelativeTime(NOW - 60, NOW)).toBe('1 minute ago');
  });

  it('returns plural minutes', () => {
    expect(getRelativeTime(NOW - 300, NOW)).toBe('5 minutes ago');
  });

  it('returns "1 hour ago" for 3600s diff', () => {
    expect(getRelativeTime(NOW - 3600, NOW)).toBe('1 hour ago');
  });

  it('returns plural hours', () => {
    expect(getRelativeTime(NOW - 7200, NOW)).toBe('2 hours ago');
  });

  it('returns "1 day ago" for 86400s diff', () => {
    expect(getRelativeTime(NOW - 86400, NOW)).toBe('1 day ago');
  });

  it('returns plural days', () => {
    expect(getRelativeTime(NOW - 86400 * 15, NOW)).toBe('15 days ago');
  });

  it('returns "1 month ago" for ~30 day diff', () => {
    expect(getRelativeTime(NOW - 2592000, NOW)).toBe('1 month ago');
  });

  it('returns plural months', () => {
    expect(getRelativeTime(NOW - 2592000 * 6, NOW)).toBe('6 months ago');
  });

  it('returns "1 year ago" for ~365 day diff', () => {
    expect(getRelativeTime(NOW - 31536000, NOW)).toBe('1 year ago');
  });

  it('returns plural years', () => {
    expect(getRelativeTime(NOW - 31536000 * 3, NOW)).toBe('3 years ago');
  });

  it('uses Date.now when nowSeconds is not provided', () => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW * 1000);
    expect(getRelativeTime(NOW - 120)).toBe('2 minutes ago');
    jest.restoreAllMocks();
  });
});
