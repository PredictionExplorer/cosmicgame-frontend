/**
 * The error a failed API read rejects with, and what a page may ask of it.
 *
 * Dependency-free on purpose: pages and hooks read the status without pulling
 * the axios client (or its test doubles) into their module graph.
 */

/**
 * Whether an API answer's body says it holds no such record: the Cosmic API
 * answers `400 {"error":"record not found"}` for one. Its other errors share
 * the 400 (`Can't parse integer parameter`, a database failure), so the
 * status alone cannot say a record is missing.
 */
export function saysRecordNotFound(body: unknown): boolean {
  const message = (body as { error?: unknown } | null | undefined)?.error;
  return typeof message === 'string' && /\brecord not found\b/i.test(message);
}

/** Whether an answer means "no such record": a 404, or a 400 that says so. */
function answersRecordNotFound(status: unknown, body: unknown): boolean {
  return status === 404 || (status === 400 && saysRecordNotFound(body));
}

/**
 * A failed read. The message stays generic (the transport detail is already on
 * the Sentry report); `status` is the HTTP status when the server answered,
 * and `recordNotFound` whether the answer said it holds no such record, so a
 * page can tell "this record does not exist" from "the read failed".
 */
export class ApiReadError extends Error {
  readonly status: number | undefined;
  readonly recordNotFound: boolean;

  /** `body` is the answer's body, when the server sent one. */
  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.status = status;
    this.recordNotFound = answersRecordNotFound(status, body);
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
 * True when the server answered that it has no such record: a 404, or the
 * Cosmic API's `400 {"error":"record not found"}` (`rounds/info/{n}` for the
 * live cycle, a cycle that has not started, or one finalized moments ago and
 * not indexed yet). Retrying cannot change the answer, and a page shows "no
 * record" rather than an error with a retry. A 400 that says anything else is
 * a failed read.
 */
export function isRecordNotFound(error: unknown): boolean {
  if (error instanceof ApiReadError) return error.recordNotFound;
  // An axios error that did not pass through a read policy.
  const response = (error as { response?: { status?: unknown; data?: unknown } } | null | undefined)
    ?.response;
  return answersRecordNotFound(response?.status, response?.data);
}
