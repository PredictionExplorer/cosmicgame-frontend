/**
 * The error a failed API read rejects with, and what a page may ask of it.
 *
 * Dependency-free on purpose: pages and hooks read the status without pulling
 * the axios client (or its test doubles) into their module graph.
 */

/**
 * A failed read. The message stays generic (the transport detail is already on
 * the Sentry report); `status` is the HTTP status when the server answered, so
 * a page can tell "this record does not exist" from "the read failed".
 */
export class ApiReadError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/**
 * The HTTP status of a failed read, or `undefined` for a network failure, a
 * timeout or an error that never reached the server.
 */
export function apiErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiReadError) return error.status;
  // An axios error that did not pass through a read policy.
  const status = (error as { response?: { status?: unknown } } | null | undefined)?.response
    ?.status;
  return typeof status === 'number' ? status : undefined;
}

/**
 * True when the server answered that it has no such record. The Cosmic API
 * answers `400 {"error":"record not found"}` for a record it does not hold
 * (`rounds/info/{n}` for the live cycle, a cycle that has not started, or one
 * finalized moments ago and not indexed yet), and some routes answer 404.
 * Retrying cannot change the answer, and a page shows "no record" rather than
 * an error with a retry.
 */
export function isRecordNotFound(error: unknown): boolean {
  const status = apiErrorStatus(error);
  return status === 400 || status === 404;
}
