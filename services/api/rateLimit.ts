/**
 * Retrying a server read the API turned away with 429 Too Many Requests.
 *
 * The API rate-limits bursts ("rate limit exceeded, slow down"), and a build
 * that prerenders hundreds of pages, or a burst of ISR regenerations, is one:
 * without a retry, each turned-away read rendered its figures as unknown and
 * the page was cached that way. A server read therefore waits and asks again,
 * a bounded number of times, spreading the retries with jitter so the pages
 * that were turned away together do not come back together. Browsers do not
 * retry here: React Query retries their reads with its own backoff.
 */

/** How many times a server read asks again after a 429, after its first try. */
export const RATE_LIMIT_RETRIES = 2;

/** The first retry waits between half of this and all of it; each later one doubles it. */
const RATE_LIMIT_BASE_DELAY_MS = 600;

/** No retry waits longer, whatever the server's Retry-After asks, so a render stays bounded. */
export const RATE_LIMIT_MAX_DELAY_MS = 3_000;

/** HTTP 429 Too Many Requests. */
export const TOO_MANY_REQUESTS = 429;

/**
 * How long to wait before retry `attempt` (0 for the first retry). A
 * `Retry-After` of whole seconds is honoured up to {@link RATE_LIMIT_MAX_DELAY_MS};
 * without one, the wait is exponential with equal jitter: half the step, plus
 * a random share of the other half.
 */
export function rateLimitDelayMs(
  attempt: number,
  retryAfter?: string | null,
  random: () => number = Math.random,
): number {
  const seconds = retryAfter == null || retryAfter.trim() === '' ? Number.NaN : Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1_000, RATE_LIMIT_MAX_DELAY_MS);
  }
  const step = Math.min(RATE_LIMIT_BASE_DELAY_MS * 2 ** attempt, RATE_LIMIT_MAX_DELAY_MS);
  return Math.round(step / 2 + random() * (step / 2));
}

/** Resolves after `ms` milliseconds. */
export function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
