import * as Sentry from '@sentry/nextjs';

export interface EthProviderError {
  code?: number;
  data?: { message?: string };
}

/** Type-guard for wallet/provider errors that carry a `.data` bag. */
export function isEthProviderError(err: unknown): err is EthProviderError {
  return typeof err === 'object' && err !== null && 'data' in err;
}

/** Returns `true` when the user explicitly rejected a wallet transaction (code 4001). */
export function isUserRejection(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 4001
  );
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
