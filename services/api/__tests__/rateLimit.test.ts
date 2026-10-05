import { RATE_LIMIT_MAX_DELAY_MS, rateLimitDelayMs } from '../rateLimit';

describe('rateLimitDelayMs', () => {
  it('honours a Retry-After of whole seconds, never past the cap', () => {
    expect(rateLimitDelayMs(0, '1')).toBe(1_000);
    expect(rateLimitDelayMs(1, '0')).toBe(0);
    expect(rateLimitDelayMs(0, '120')).toBe(RATE_LIMIT_MAX_DELAY_MS);
  });

  it('backs off exponentially with jitter when the server names no wait', () => {
    // Equal jitter: half the step, plus a random share of the other half.
    expect(rateLimitDelayMs(0, null, () => 0)).toBe(300);
    expect(rateLimitDelayMs(0, null, () => 1)).toBe(600);
    expect(rateLimitDelayMs(1, undefined, () => 0)).toBe(600);
    expect(rateLimitDelayMs(1, '', () => 1)).toBe(1_200);
    expect(rateLimitDelayMs(8, null, () => 1)).toBe(RATE_LIMIT_MAX_DELAY_MS);
  });

  it('reads an HTTP-date or garbage Retry-After as no wait named', () => {
    expect(rateLimitDelayMs(0, 'Wed, 21 Oct 2026 07:28:00 GMT', () => 0)).toBe(300);
    expect(rateLimitDelayMs(0, 'soon', () => 0)).toBe(300);
  });
});
