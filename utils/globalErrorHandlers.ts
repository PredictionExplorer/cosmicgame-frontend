import { reportError } from './errors';

let installed = false;

/**
 * Installs global handlers for `window.onerror` and `window.onunhandledrejection`
 * so that uncaught errors outside React's tree are logged and reported to Sentry.
 * Safe to call multiple times; only the first call installs.
 */
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, 'globalError');
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, 'unhandledRejection');
  });
}
