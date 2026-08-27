/**
 * Tiny JSON-RPC + HTTP polling helpers used by the orchestrator's health
 * checks. The director uses viem; this module stays dependency-free so the
 * orchestrator can probe endpoints before anything heavier is loaded.
 */

export class WaitTimeoutError extends Error {
  constructor(what: string, timeoutMs: number, lastError?: unknown) {
    const suffix = lastError instanceof Error ? ` Last error: ${lastError.message}` : '';
    super(`Timed out after ${Math.round(timeoutMs / 1000)}s waiting for ${what}.${suffix}`);
    this.name = 'WaitTimeoutError';
  }
}

/** Thrown by a probe to abort waiting immediately (the wait can never succeed). */
export class WaitAbortedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'WaitAbortedError';
  }
}

const sleep = (ms: number) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

export interface WaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

/** Poll `probe` until it resolves truthy; throws WaitTimeoutError otherwise. */
export async function waitFor<T>(
  what: string,
  probe: () => Promise<T | null | undefined | false>,
  { timeoutMs = 120_000, intervalMs = 500 }: WaitOptions = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  for (;;) {
    try {
      const result = await probe();
      if (result) return result;
    } catch (err) {
      if (err instanceof WaitAbortedError) throw err;
      lastError = err;
    }
    if (Date.now() >= deadline) throw new WaitTimeoutError(what, timeoutMs, lastError);
    await sleep(intervalMs);
  }
}

let nextRequestId = 1;

/** Single JSON-RPC call. Throws on HTTP or RPC-level errors. */
export async function jsonRpc<T = unknown>(
  url: string,
  method: string,
  params: unknown[] = [],
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextRequestId++, method, params }),
  });
  if (!response.ok) throw new Error(`${method}: HTTP ${response.status}`);
  const body = (await response.json()) as { result?: T; error?: { code: number; message: string } };
  if (body.error) throw new Error(`${method}: RPC error ${body.error.code}: ${body.error.message}`);
  return body.result as T;
}

/** GET a URL and return parsed JSON, or throw on non-2xx. */
export async function httpJson<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GET ${url}: HTTP ${response.status}`);
  return (await response.json()) as T;
}
