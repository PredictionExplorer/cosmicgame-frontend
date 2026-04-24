import * as Sentry from '@sentry/nextjs';

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

/** Type-guard for wallet/provider errors that carry a `.data` bag. */
export function isEthProviderError(err: unknown): err is EthProviderError {
  return typeof err === 'object' && err !== null && 'data' in err;
}

/**
 * Shown when the user closes the wallet or rejects signing (EIP-1193 code 4001).
 * Prefer `type: 'info'` in notifications — this is not a failure.
 */
export const WALLET_TRANSACTION_CANCELLED_MESSAGE =
  'Transaction not sent — you cancelled it in your wallet.';

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
 * Extracts a user-friendly message from an Ethereum provider error,
 * falling back to a default when none is available.
 */
export function getEthErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (isEthProviderError(err) && err.data?.message) {
    return err.data.message;
  }
  return fallback;
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
