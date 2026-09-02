import * as Sentry from '@sentry/nextjs';

import { getLocaleConfig } from '@/i18n/localeConfig';

/**
 * Generic error-handling utilities.
 *
 * This module deliberately imports NO Web3 code (no viem, no wagmi) so
 * the landing shell, ErrorBoundary, and globalErrorHandlers — all loaded
 * on the marketing host — can use `reportError` without dragging wallet
 * SDKs into the landing client bundle.
 *
 * Contract-revert-specific helpers (`getContractErrorMessage`,
 * `isContractRevertError`, `CUSTOM_ERROR_MESSAGES`) live in
 * `utils/contractErrors.ts` — import from there when you need them.
 */

export interface EthProviderError {
  code?: number;
  data?: { message?: string };
}

export interface EthErrorMessageOptions {
  /**
   * The active UI locale. Whether provider diagnostics may be shown is a
   * per-locale policy (`showRawProviderErrors` in i18n/localeConfig.ts):
   * wallets and RPC nodes return arbitrary English strings, so non-English
   * locales hide them. The original error should still be passed to
   * `reportError`.
   */
  locale?: string;
  /** Explicitly override whether the provider's raw message may be displayed. */
  preserveProviderMessage?: boolean;
}

/** Type-guard for wallet/provider errors that carry a `.data` bag. */
export function isEthProviderError(err: unknown): err is EthProviderError {
  return typeof err === 'object' && err !== null && 'data' in err;
}

/**
 * Returns `true` when the user dismissed the wallet or rejected signing (EIP-1193 4001).
 * Walks viem `cause` chains and `UserRejectedRequestError` — rejection is often nested.
 *
 * This uses duck-typing (no viem import), so it's safe to call from any
 * context even when viem isn't loaded.
 */
export function isUserRejection(err: unknown): boolean {
  if (err == null) return false;
  const seen = new WeakSet<object>();

  function walk(e: unknown): boolean {
    if (e == null || typeof e !== 'object') return false;
    if (seen.has(e as object)) return false;
    seen.add(e as object);

    const o = e as Record<string, unknown>;

    const code = o.code;
    if (code === 4001 || code === 'ACTION_REJECTED') return true;

    const name = typeof o.name === 'string' ? o.name : '';
    if (name === 'UserRejectedRequestError') return true;

    const msg = typeof o.message === 'string' ? o.message.toLowerCase() : '';
    const short =
      typeof (o as { shortMessage?: string }).shortMessage === 'string'
        ? (o as { shortMessage: string }).shortMessage.toLowerCase()
        : '';
    const combined = `${msg} ${short}`;
    if (
      combined.includes('user rejected') ||
      combined.includes('user denied') ||
      combined.includes('rejected the request') ||
      combined.includes('denied transaction') ||
      combined.includes('denied the transaction') ||
      combined.includes('user cancelled') ||
      combined.includes('user canceled') ||
      combined.includes('request rejected') ||
      combined.includes('rejected this request')
    ) {
      return true;
    }

    if (o.cause) return walk(o.cause);

    const walkFn = (o as { walk?: (fn: (e: Error) => boolean) => Error }).walk;
    if (typeof walkFn === 'function') {
      try {
        const inner = walkFn.call(o, (child: Error) => {
          const c = child as unknown as Record<string, unknown>;
          return (
            child.name === 'UserRejectedRequestError' ||
            c.code === 4001 ||
            c.code === 'ACTION_REJECTED'
          );
        });
        if (inner) return true;
      } catch {
        /* ignore */
      }
    }

    return false;
  }

  return walk(err);
}

/**
 * Extracts a user-friendly message from an Ethereum provider error.
 *
 * Existing callers remain byte-for-byte compatible: without options, a
 * provider message is returned when present. Locale-aware transaction callers
 * should pass `{locale}` so Chinese UI receives the translated fallback while
 * the raw diagnostic remains available to logging and error reporting.
 */
export function getEthErrorMessage(
  err: unknown,
  fallback = 'An error occurred',
  options: EthErrorMessageOptions = {},
): string {
  const preserveProviderMessage =
    options.preserveProviderMessage ?? getLocaleConfig(options.locale).showRawProviderErrors;

  if (preserveProviderMessage && isEthProviderError(err) && err.data?.message) {
    return err.data.message;
  }
  return fallback;
}

/**
 * True when the error is a transport-level failure reaching an RPC or API
 * endpoint — fetch failed, connection refused/reset, request timed out —
 * rather than an application-level error. Walks viem-style `cause` chains via
 * duck-typing (no viem import; see module doc). Periodic background reads use
 * this to avoid flooding the console and Sentry while a server restarts or
 * the network blips: such failures resolve themselves on the next poll.
 */
export function isTransientNetworkError(err: unknown): boolean {
  const seen = new WeakSet<object>();

  function walk(e: unknown): boolean {
    if (e == null || typeof e !== 'object') return false;
    if (seen.has(e as object)) return false;
    seen.add(e as object);

    const o = e as { name?: unknown; message?: unknown; details?: unknown; cause?: unknown };
    const name = typeof o.name === 'string' ? o.name : '';
    if (name === 'HttpRequestError' || name === 'TimeoutError') return true;

    const text = [o.message, o.details]
      .filter((v): v is string => typeof v === 'string')
      .join(' ')
      .toLowerCase();
    if (
      text.includes('failed to fetch') || // Chrome fetch TypeError
      text.includes('fetch failed') || // Node/undici
      text.includes('load failed') || // Safari fetch TypeError
      text.includes('network request failed') ||
      text.includes('http request failed') || // viem HttpRequestError
      text.includes('timed out') ||
      text.includes('econnrefused') ||
      text.includes('econnreset')
    ) {
      return true;
    }

    return walk(o.cause);
  }

  return walk(err);
}

const lastReportAtByContext = new Map<string, number>();

/**
 * Like `reportError`, but reports at most once per `intervalMs` for a given
 * context key. For failures inside polling/retry loops, where every retry
 * would otherwise emit a console dump and a Sentry event.
 */
export function reportErrorThrottled(
  error: unknown,
  context: string,
  intervalMs = 5 * 60_000,
): void {
  const now = Date.now();
  if (now - (lastReportAtByContext.get(context) ?? 0) < intervalMs) return;
  lastReportAtByContext.set(context, now);
  reportError(error, context);
}

/**
 * Reports an error to Sentry (if configured) and logs it to the console.
 * Use this instead of bare `console.error` throughout the codebase.
 */
export function reportError(error: unknown, context?: string): void {
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error(error);
  }

  if (error instanceof Error) {
    Sentry.captureException(error, context ? { tags: { context } } : undefined);
  } else {
    Sentry.captureMessage(String(error), {
      level: 'error',
      ...(context ? { tags: { context } } : {}),
    });
  }
}
